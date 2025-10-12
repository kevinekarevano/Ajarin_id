# Security Policy

## Supported Versions

Kami mendukung versi Ajarin.id berikut dengan update keamanan:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Keamanan pengguna adalah prioritas utama kami. Jika Anda menemukan kerentanan keamanan, mohon laporkan dengan cara yang bertanggung jawab.

### Cara Melaporkan

1. **Email**: Kirim detail kerentanan ke security@ajarin.id
2. **Encrypted Communication**: Gunakan PGP key kami jika tersedia
3. **Jangan**: Jangan buat public issue untuk kerentanan keamanan

### Informasi yang Perlu Disertakan

- Deskripsi detail kerentanan
- Steps to reproduce
- Potential impact
- Suggested fix (jika ada)
- Your contact information

### Response Timeline

- **24 jam**: Konfirmasi penerimaan laporan
- **72 jam**: Initial assessment dan acknowledgment
- **7 hari**: Detailed response dengan timeline perbaikan
- **30 hari**: Target resolution (tergantung kompleksitas)

### Disclosure Policy

- Kami akan mengakui kontribusi Anda (kecuali Anda meminta sebaliknya)
- Kami akan memberikan update regular tentang progress
- Kami meminta Anda tidak mengungkapkan kerentanan secara publik sampai kami merilis fix
- Setelah fix dirilis, Anda bebas mempublikasikan finding Anda

### Scope

Kerentanan yang dalam scope:

- **Authentication bypass**
- **Privilege escalation**
- **SQL injection**
- **Cross-site scripting (XSS)**
- **Cross-site request forgery (CSRF)**
- **Server-side request forgery (SSRF)**
- **Remote code execution**
- **Local file inclusion/disclosure**
- **Directory traversal**
- **Sensitive data exposure**

### Out of Scope

- **DDoS attacks**
- **Social engineering attacks**
- **Physical attacks**
- **Spam or phishing content**
- **Rate limiting bypass** (kecuali menyebabkan masalah serius)
- **Missing security headers** (kecuali menyebabkan exploit spesifik)
- **SSL/TLS configuration issues** (kecuali menyebabkan data leak)

### Security Measures

Kami menerapkan langkah-langkah keamanan berikut:

#### Backend Security

- **Authentication**: JWT tokens dengan expiration
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive input sanitization
- **Database**: Prepared statements untuk prevent SQL injection
- **Rate Limiting**: API rate limiting untuk prevent abuse
- **CORS**: Proper CORS configuration
- **Helmet**: Security headers dengan Helmet.js

#### Frontend Security

- **XSS Protection**: Content Security Policy (CSP)
- **HTTPS**: All communications encrypted
- **Secure Cookies**: HttpOnly dan Secure flags
- **Input Sanitization**: Client-side input validation
- **Dependencies**: Regular security audits

#### Infrastructure Security

- **Environment Variables**: Sensitive data dalam env vars
- **Database**: Encrypted connections
- **File Uploads**: Secure file handling dengan Cloudinary
- **Monitoring**: Security monitoring dan logging

### Best Practices for Contributors

Jika Anda berkontribusi code, mohon ikuti practices berikut:

1. **Sanitize Input**: Selalu validasi dan sanitize user input
2. **Use Prepared Statements**: Untuk database queries
3. **Implement CSRF Protection**: Untuk state-changing operations
4. **Validate Authorization**: Check user permissions untuk setiap action
5. **Handle Errors Securely**: Jangan expose sensitive information dalam error messages
6. **Use HTTPS**: Untuk semua communications
7. **Keep Dependencies Updated**: Regular updates untuk security patches

### Security Tools

Kami menggunakan tools berikut untuk maintain security:

- **npm audit**: Regular dependency vulnerability checks
- **ESLint Security Plugin**: Static code analysis
- **Helmet.js**: Security headers
- **bcrypt**: Password hashing
- **jsonwebtoken**: Secure token handling
- **express-rate-limit**: Rate limiting
- **cors**: CORS configuration
- **express-validator**: Input validation

### Contact Information

- **Security Email**: security@ajarin.id
- **General Contact**: support@ajarin.id
- **Response Language**: Indonesian, English

### Acknowledgments

Kami berterima kasih kepada security researchers yang membantu menjaga keamanan Ajarin.id:

<!-- Akan di-update dengan daftar contributors -->

---

_Terakhir diperbarui: Januari 2024_
