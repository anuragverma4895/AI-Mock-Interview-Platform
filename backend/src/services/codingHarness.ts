export type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'c';
export type TestCase = { input: string; expectedOutput: string };
export type ChallengeShape = {
  title: string;
  starterCode?: string;
  starterCodes?: Record<string, string>;
};

function parseArguments(input: string): unknown[] {
  const normalized = input.trim().replace(/(^|,)\s*\w+\s*=\s*/g, '$1').replace(/'/g, '"');
  try { return JSON.parse('[' + normalized + ']') as unknown[]; }
  catch { throw new Error('This test case uses an unsupported input format'); }
}
function splitArguments(value: string): string[] {
  let nesting = 0, start = 0; const parts: string[] = [];
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '<') nesting++;
    else if (value[i] === '>') nesting--;
    else if (value[i] === ',' && nesting === 0) {
      parts.push(value.slice(start, i).trim()); start = i + 1;
    }
  }
  if (value.slice(start).trim()) parts.push(value.slice(start).trim());
  return parts;
}
function detectSignature(challenge: ChallengeShape, language: Language) {
  const raw = challenge.starterCodes?.[language] || challenge.starterCode || '';
  const code = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  if (language === 'python') {
    const match = code.match(/^\s*def\s+(\w+)\s*\(([^)]*)\)/m);
    if (!match) throw new Error('Unable to detect Python function');
    return { name: match[1], returns: '', args: match[2].split(',').map(x=>x.trim()).filter(x=>x && x !== 'self') };
  }
  const patterns: Partial<Record<Language, RegExp>> = {
    cpp: /([\w:<>, *&]+?)\s+(\w+)\s*\(([^()]*)\)\s*\{/,
    java: /public\s+([\w<>\[\], ?]+?)\s+(\w+)\s*\(([^()]*)\)/,
    c: /([\w *]+?)\s+(\w+)\s*\(([^()]*)\)\s*\{/,
  };
  const match = code.match(patterns[language] || /$^/);
  if (!match) throw new Error('Unable to detect '+language+' function signature');
  return { name:match[2], returns:match[1].replace(/^.*(?:public|private|protected)\s*:\s*/s, '').trim(), args:splitArguments(match[3]) };
}
function paramType(declaration: string): string {
  return declaration.replace(/\b\w+\s*$/, '').trim().replace(/^const\s+/, '').replace(/[&]\s*$/, '').trim();
}
function cppValue(value: unknown, type: string): string {
  const t=type.replace(/\s+/g, '').replace(/^std::/,'');
  if (value === null) return 'nullptr';
  if (t.startsWith('vector<')) {
    if (!Array.isArray(value)) throw new Error('Expected a vector input');
    const child=t.substring(7,t.length-1);
    return '{'+value.map(v=>cppValue(v,child)).join(',')+'}';
  }
  if (t === 'string') return JSON.stringify(String(value));
  if (t === 'char') return String.fromCharCode(39)+String(value)+String.fromCharCode(39);
  if (t === 'bool') return value ? 'true':'false';
  if (/^(?:int|long|longlong|double|float|short|unsignedint)$/.test(t)) return String(value);
  if (t === 'ListNode*' && Array.isArray(value)) return 'makeList('+cppValue(value,'vector<int>')+')';
  throw new Error('Unsupported '+type+' C++ parameter; use a supported input format');
}
function cppSource(code: string, challenge: ChallengeShape, values: unknown[]) {
  const sig=detectSignature(challenge,'cpp');
  if (sig.args.length!==values.length) throw new Error('C++ argument count does not match test input');
  const setup=sig.args.map((decl,i)=>{
    const type=paramType(decl);
    return type+' x'+i+'='+cppValue(values[i],type)+';';
  }).join('\n');
  const helpers=[
    'struct ListNode {int val;ListNode* next;ListNode(int v,ListNode* n=nullptr):val(v),next(n){}};',
    'ListNode* makeList(vector<int> a){ListNode* h=nullptr;for(int i=int(a.size())-1;i>=0;i--)h=new ListNode(a[i],h);return h;}',
    'string dump(const string& s){return string(1,34)+s+string(1,34);}',
    'string dump(bool b){return b?"true":"false";}',
    'template<class T> typename enable_if<is_arithmetic<T>::value && !is_same<T,bool>::value,string>::type dump(T x){return to_string(x);}',
    'template<class T>string dump(const vector<T>& a){string o="[";for(size_t i=0;i<a.size();i++){if(i)o+=",";o+=dump(a[i]);}return o+"]";}',
    'string dump(ListNode* p){vector<int> a;for(int i=0;p&&i<1000;i++,p=p->next)a.push_back(p->val);return dump(a);}',
  ].join('\n');
  const init=/\bclass\s+Solution\b/.test(code)?'Solution obj;':'';
  const call=(init?'obj.':'')+sig.name+'('+values.map((_,i)=>'x'+i).join(',')+')';
  const output=/\bvoid\b/.test(sig.returns) ? call+';cout<<dump(x0);':'auto result='+call+';cout<<dump(result);';
  // Only define ListNode if user's code does not already define one.
  const withHelpers=/\b(?:class|struct)\s+ListNode\b/.test(code.replace(/\/\*[\s\S]*?\*\//g,''))?
    helpers.replace(/^struct ListNode \{[^\n]+\n/,''):helpers;
  return '#include <bits/stdc++.h>\nusing namespace std;\n'+withHelpers+'\n'+code+
    '\nint main(){\n'+setup+'\n'+init+'\n'+output+'\n}\n';
}
function javaValue(value: unknown, type: string): string {
  const t=type.replace(/\s+/g,'');
  if (value===null) return 'null';
  if (t.endsWith('[]')) {
    if (!Array.isArray(value)) throw new Error('Expected Java array');
    const inner=t.slice(0,-2);
    return 'new '+inner+'[]{'+value.map(v=>javaValue(v,inner)).join(',')+'}';
  }
  if (t==='String') return JSON.stringify(String(value));
  if (t==='char') return "'"+String(value)+"'";
  if (t==='boolean') return value?'true':'false';
  if (/^(?:int|double|float|long|short)$/.test(t)) return String(value);
  if (t.startsWith('List<')) {
    if (!Array.isArray(value)) throw new Error('Expected Java List');
    const inner=t.slice(5,-1);
    return 'new ArrayList<>(Arrays.asList('+value.map(v=>javaValue(v,inner)).join(',')+'))';
  }
  if (t==='ListNode' && Array.isArray(value)) return 'makeList(new int[]{'+value.join(',')+'})';
  throw new Error('Unsupported Java parameter type: '+type);
}
function javaSource(code: string, challenge: ChallengeShape, values: unknown[]) {
  const sig=detectSignature(challenge,'java');
  if (sig.args.length!==values.length) throw new Error('Java argument count does not match test input');
  const setup=sig.args.map((decl,i)=>{
    const type=paramType(decl);
    return type+' x'+i+'='+javaValue(values[i],type)+';';
  }).join('\n');
  const helpers=[
    'static String dump(Object x){',
    'if(x==null)return "null";',
    'if(x instanceof String || x instanceof Character)return String.valueOf((char)34)+x.toString()+String.valueOf((char)34);',
    'if(x.getClass().isArray()){List<String> a=new ArrayList<>();for(int i=0;i<java.lang.reflect.Array.getLength(x);i++)a.add(dump(java.lang.reflect.Array.get(x,i)));return "["+String.join(",",a)+"]";}',
    'if(x instanceof Collection){List<String> a=new ArrayList<>();for(Object v:(Collection<?>)x)a.add(dump(v));return "["+String.join(",",a)+"]";}',
    'if(x instanceof ListNode){List<Integer> a=new ArrayList<>();ListNode p=(ListNode)x;for(int i=0;p!=null&&i<1000;i++,p=p.next)a.add(p.val);return dump(a);}',
    'return x.toString();}',
    'static ListNode makeList(int[] a){ListNode h=null;for(int i=a.length-1;i>=0;i--){ListNode n=new ListNode(a[i]);n.next=h;h=n;}return h;}',
  ].join('\n');
  const defs=/\bclass\s+ListNode\b/.test(code.replace(/\/\*[\s\S]*?\*\//g,''))?'': 'class ListNode {int val;ListNode next;ListNode(int v){val=v;}}\n';
  const stripped=code.replace(/^\s*import\s+[^;]+;\s*/gm,'');
  const call='new Solution().'+sig.name+'('+values.map((_,i)=>'x'+i).join(',')+')';
  const output=sig.returns==='void'?call+';System.out.print(dump(x0));':'System.out.print(dump('+call+'));';
  return 'import java.util.*;\n'+defs+stripped+'\npublic class Main{\n'+helpers+
    '\npublic static void main(String[] args){\n'+setup+'\n'+output+'\n}}\n';
}
function pythonSource(code: string, challenge: ChallengeShape) {
  const sig=detectSignature(challenge,'python');
  const invocation=/^\s*class\s+Solution\s*:/m.test(code)?'Solution().'+sig.name:sig.name;
  const helpers=[
    'import json,sys',
    'class ListNode:',
    ' def __init__(self,val=0,next=None):self.val,self.next=val,next',
    'def makeList(a):',
    ' head=None',
    ' for x in reversed(a):head=ListNode(x,head)',
    ' return head',
    'def convert(x):',
    ' if isinstance(x,ListNode):',
    '  arr=[]',
    '  while x and len(arr)<1000:arr.append(x.val);x=x.next',
    '  return arr',
    ' if isinstance(x,list):return [convert(v) for v in x]',
    ' return x',
  ].join('\n');
  const convertArg=code.includes('ListNode') ? 'args=[makeList(x) if isinstance(x,list) else x for x in args]\n' : '';
  return helpers+'\n'+code+'\nargs=json.loads(sys.stdin.read())\n'+convertArg+
    'value='+invocation+'(*args)\nif value is None:value=args[0] if args else None\n'+
    'print(json.dumps(convert(value),separators=(",",":")))\n';
}
function cSource(code: string, challenge: ChallengeShape, values: unknown[]) {
  const sig=detectSignature(challenge,'c');
  const defs: string[]=[]; const args: string[]=[];
  let input=0, firstArray='', firstLength='', resultLength='';
  for (let i=0;i<sig.args.length;i++){
    const decl=sig.args[i], type=paramType(decl).replace(/\s/g,'');
    const name=decl.match(/([a-zA-Z_]\w*)\s*$/)?.[1]||'arg'+i;
    if (/returnSize/i.test(name)){
      defs.push('int '+name+'=0;');args.push('&'+name);resultLength=name;continue;
    }
    if (/Size$|Length$/.test(name)&&firstLength&&type==='int'){
      args.push(firstLength);continue;
    }
    const val=values[input++];
    if(val===undefined)throw new Error('C signature does not match input');
    if(type==='int*'&&Array.isArray(val)){
      defs.push('int arr'+i+'[]={'+val.map(v=>Number(v)).join(',')+'};');
      args.push('arr'+i);if(!firstArray){firstArray='arr'+i;firstLength=String(val.length);}
    } else if(type==='char*'&&typeof val==='string'){
      defs.push('char str'+i+'[]='+JSON.stringify(val)+';');args.push('str'+i);
    } else if(/^(int|double|long|bool)$/.test(type)){
      defs.push(type+' arg'+i+'='+String(val)+';');args.push('arg'+i);
    } else throw new Error('Unsupported C signature parameter: '+type);
  }
  if(input!==values.length)throw new Error('C input count does not match signature');
  const call=sig.name+'('+args.join(',')+')';
  let output='';
  if(sig.returns.includes('void')) {
    output=call+';'+(firstArray?
      'printf("[");for(int i=0;i<'+firstLength+';i++){if(i)printf(",");printf("%d",'+firstArray+'[i]);}printf("]");':'printf("null");');
  } else if(sig.returns.includes('*')&&resultLength) {
    output='int* result='+call+';printf("[");for(int i=0;i<'+resultLength+';i++){if(i)printf(",");printf("%d",result[i]);}printf("]");';
  } else if(sig.returns.includes('bool'))output='printf('+call+'?"true":"false");';
  else output='printf("%.12g",(double)('+call+'));';
  return '#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n#include <string.h>\n'+
    code+'\nint main(){\n'+defs.join('\n')+'\n'+output+'\nreturn 0;}\n';
}
export function buildSubmission(language: Language, code: string, challenge: ChallengeShape, test: TestCase) {
  if(typeof code!=='string'||!code.trim()||code.length>50000)throw new Error('Invalid code (maximum 50,000 characters)');
  const values=parseArguments(test.input);
  if(language==='python')return {source_code:pythonSource(code,challenge),stdin:JSON.stringify(values)};
  if(language==='cpp')return {source_code:cppSource(code,challenge,values),stdin:''};
  if(language==='java')return {source_code:javaSource(code,challenge,values),stdin:''};
  if(language==='c')return {source_code:cSource(code,challenge,values),stdin:''};
  throw new Error('Unsupported language for external runner: '+language);
}
