# Contributing to Ajarin.id

Terima kasih atas minat Anda untuk berkontribusi pada Ajarin.id! 🎉

## 🤝 Code of Conduct

Proyek ini mengadopsi Contributor Covenant Code of Conduct. Dengan berpartisipasi, Anda diharapkan untuk menjunjung tinggi code of conduct ini.

## 🚀 Getting Started

1. Fork repository ini
2. Clone fork Anda ke local machine
3. Buat branch baru untuk feature/bugfix
4. Buat perubahan Anda
5. Test perubahan Anda
6. Commit dengan pesan yang jelas
7. Push ke fork Anda
8. Buat Pull Request

## 📋 Development Setup

### Prerequisites

- Node.js 16+
- MongoDB (local atau Atlas)
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/your-username/Ajarin_id.git
cd Ajarin_id

# Setup backend
cd server
npm install
cp .env.example .env
# Edit .env dengan konfigurasi Anda
npm run dev

# Setup frontend (terminal baru)
cd client
npm install
npm run dev
```

## 🎯 Types of Contributions

### 🐛 Bug Reports

- Gunakan GitHub Issues
- Berikan detail yang jelas
- Sertakan steps to reproduce
- Sertakan screenshot jika memungkinkan

### ✨ Feature Requests

- Diskusikan di GitHub Discussions atau Issues
- Jelaskan use case dan benefit
- Berikan mockup jika memungkinkan

### 🔧 Code Contributions

- Bug fixes
- New features
- Performance improvements
- Documentation improvements

## 📝 Commit Guidelines

### Commit Message Format

```
type(scope): subject

body

footer
```

### Types

- `feat`: Feature baru
- `fix`: Bug fix
- `docs`: Perubahan dokumentasi
- `style`: Formatting, missing semicolons, etc
- `refactor`: Code refactoring
- `test`: Menambah atau mengubah tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add password reset functionality

Add password reset feature with email verification.
Users can now reset their password by clicking a link
sent to their email address.

Closes #123
```

```
fix(dashboard): resolve course enrollment bug

Fixed issue where users couldn't enroll in courses
due to validation error in enrollment controller.

Fixes #456
```

## 🏗️ Branch Naming

- `feature/description` - untuk feature baru
- `fix/description` - untuk bug fixes
- `docs/description` - untuk dokumentasi
- `refactor/description` - untuk refactoring

Examples:

- `feature/user-profile-page`
- `fix/course-enrollment-bug`
- `docs/api-documentation`

## 🧪 Testing

### Frontend Testing

```bash
cd client
npm run test        # Run unit tests
npm run test:e2e    # Run e2e tests (jika ada)
npm run lint        # Run linting
```

### Backend Testing

```bash
cd server
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run lint        # Run linting
```

## 📦 Pull Request Process

1. **Pastikan branch Anda up-to-date**

   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Test semua perubahan**

   - Run tests
   - Test manually di browser
   - Check console untuk errors

3. **Update dokumentasi jika diperlukan**

   - README.md
   - API documentation
   - Code comments

4. **Buat Pull Request**
   - Gunakan template yang disediakan
   - Berikan deskripsi yang jelas
   - Link ke issues yang terkait
   - Sertakan screenshots untuk UI changes

### Pull Request Template

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)

## Screenshots (if applicable)

Add screenshots here

## Related Issues

Closes #123
```

## 🎨 Coding Standards

### JavaScript/React

- Gunakan ES6+ features
- Functional components dengan hooks
- Descriptive variable names
- Add comments untuk complex logic
- Use TypeScript jika memungkinkan

### CSS/Styling

- Gunakan Tailwind CSS utilities
- Consistent spacing dan naming
- Mobile-first responsive design
- Dark theme compatible

### Backend

- RESTful API design
- Proper error handling
- Input validation
- Security best practices

## 📁 Project Structure

```
Ajarin_id/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── utils/         # Utility functions
│   │   └── lib/           # Configurations
├── server/                # Backend Node.js app
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── utils/         # Utility functions
└── docs/                  # Documentation
```

## 🔍 Code Review Process

1. **Automated Checks**

   - GitHub Actions CI/CD
   - ESLint untuk code quality
   - Tests harus pass

2. **Manual Review**

   - Code functionality
   - Code quality dan readability
   - Security considerations
   - Performance impact

3. **Approval Process**
   - Minimal 1 approval dari maintainer
   - All conversations resolved
   - CI/CD checks pass

## 🚫 What Not to Contribute

- Plagiarized code
- Code yang melanggar copyright
- Malicious code
- Code tanpa proper testing
- Breaking changes tanpa diskusi

## 🎯 Priority Areas

Area kontribusi yang sangat dibutuhkan:

### High Priority

- [ ] Unit testing coverage
- [ ] Performance optimization
- [ ] Security improvements
- [ ] Accessibility improvements

### Medium Priority

- [ ] Mobile app (React Native)
- [ ] Advanced search features
- [ ] Real-time notifications
- [ ] Advanced analytics

### Low Priority

- [ ] UI/UX improvements
- [ ] Additional integrations
- [ ] Advanced admin features

## 💬 Communication

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General discussions, questions
- **Discord**: Real-time chat (link in README)
- **Email**: security@ajarin.id untuk security issues

## 🏆 Recognition

Contributors akan diakui di:

- README.md Contributors section
- Release notes
- Hall of Fame (untuk major contributions)

## 📜 License

Dengan berkontribusi, Anda setuju bahwa kontribusi Anda akan dilisensikan di bawah MIT License yang sama dengan proyek ini.

## ❓ Questions?

Jika ada pertanyaan, jangan ragu untuk:

- Buat issue dengan label "question"
- Join Discord community
- Email ke support@ajarin.id

---

Terima kasih telah berkontribusi untuk membuat Ajarin.id menjadi lebih baik! 🙏
