"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResume = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const TECHNICAL_SKILLS = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel',
    'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch', 'graphql', 'rest', 'api',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'linux', 'html', 'css',
    'tailwind', 'bootstrap', 'sql', 'nosql', 'machine learning', 'ai', 'data science',
    'typescript', 'nextjs', 'nuxt', 'svelte', 'flutter', 'react native', 'swift', 'kotlin'
];
const PROJECT_KEYWORDS = ['project', 'built', 'developed', 'created', 'implemented', 'designed'];
const EXPERIENCE_KEYWORDS = ['experience', 'work', 'intern', 'role', 'position', 'company'];
const parseResume = async (filePath) => {
    const ext = path_1.default.extname(filePath).toLowerCase();
    let text;
    if (ext === '.pdf') {
        text = await parsePDF(filePath);
    }
    else if (ext === '.docx') {
        text = await parseDOCX(filePath);
    }
    else {
        throw new Error('Unsupported file format. Only PDF and DOCX are supported.');
    }
    return extractInformation(text);
};
exports.parseResume = parseResume;
const parsePDF = async (filePath) => {
    const dataBuffer = fs_1.default.readFileSync(filePath);
    const data = await (0, pdf_parse_1.default)(dataBuffer);
    return data.text;
};
const parseDOCX = async (filePath) => {
    const result = await mammoth_1.default.extractRawText({ path: filePath });
    return result.value;
};
const extractInformation = (text) => {
    const lowerText = text.toLowerCase();
    const skills = extractSkills(lowerText);
    const projects = extractProjects(text);
    const experience = extractExperience(text);
    return { skills, projects, experience };
};
const extractSkills = (text) => {
    const foundSkills = [];
    for (const skill of TECHNICAL_SKILLS) {
        if (text.includes(skill)) {
            foundSkills.push(skill);
        }
    }
    const skillSections = text.match(/(?:skills|technical skills|technologies)[\s:]*([\s\S]*?)(?:\n\n|$)/gi);
    if (skillSections) {
        for (const section of skillSections) {
            const skills = section.split(/[,;\n]/).map(s => s.trim().toLowerCase()).filter(s => s.length > 2);
            for (const skill of skills) {
                if (!foundSkills.includes(skill) && TECHNICAL_SKILLS.some(ts => skill.includes(ts))) {
                    foundSkills.push(skill);
                }
            }
        }
    }
    return [...new Set(foundSkills)];
};
const extractProjects = (text) => {
    const projects = [];
    const lines = text.split('\n');
    let inProjectSection = false;
    let currentProject = null;
    for (const line of lines) {
        const lowerLine = line.toLowerCase().trim();
        if (PROJECT_KEYWORDS.some(kw => lowerLine.includes(kw)) && lowerLine.length < 100) {
            inProjectSection = true;
            currentProject = { name: line.trim(), description: '' };
        }
        else if (inProjectSection && currentProject && line.trim().length > 20) {
            currentProject.description += ' ' + line.trim();
        }
        else if (inProjectSection && currentProject && currentProject.description && line.trim().length === 0) {
            if (currentProject.description.length > 10) {
                projects.push(currentProject);
            }
            currentProject = null;
            inProjectSection = false;
        }
    }
    if (currentProject && currentProject.description.length > 10) {
        projects.push(currentProject);
    }
    return projects.slice(0, 5);
};
const extractExperience = (text) => {
    const experience = [];
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lowerLine = line.toLowerCase();
        if (EXPERIENCE_KEYWORDS.some(kw => lowerLine.includes(kw)) && line.length < 80) {
            const parts = line.split(/[-–]/);
            if (parts.length >= 1) {
                experience.push({
                    company: parts[0].replace(EXPERIENCE_KEYWORDS.join('|'), '').trim(),
                    role: parts.length > 1 ? parts[1].trim() : '',
                    duration: parts.length > 2 ? parts[2].trim() : '',
                });
            }
        }
    }
    return experience.slice(0, 5);
};
//# sourceMappingURL=resumeParser.js.map