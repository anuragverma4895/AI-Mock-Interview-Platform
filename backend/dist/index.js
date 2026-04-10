"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const auth_1 = __importDefault(require("./routes/auth"));
const resume_1 = __importDefault(require("./routes/resume"));
const interview_1 = __importDefault(require("./routes/interview"));
const video_1 = __importDefault(require("./routes/video"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
const uploadsDir = path_1.default.join(__dirname, '..', 'uploads');
app.use('/uploads', express_1.default.static(uploadsDir));
(0, db_1.default)();
app.use('/api/auth', auth_1.default);
app.use('/api/resume', resume_1.default);
app.use('/api/interview', interview_1.default);
app.use('/api/video', video_1.default);
app.use('/api/analytics', analytics_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Mock Interview Platform API is running' });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map