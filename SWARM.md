Below is a comprehensive, detailed list of everything your AI security agents should scan for inside a codebase. This list is organized by categories and covers traditional vulnerabilities, contemporary issues, and best practices. It’s designed for a tool that runs as part of your developer DX flow (e.g. via “npm install butterfly; butterfly run”) and focuses solely on code-level security issues.

I. Input Validation & Injection Flaws
SQL Injection

Look for concatenated SQL queries or unsafe string interpolation instead of parameterized queries/prepared statements.
Command Injection

Detect cases where unsanitized inputs are passed to system commands (e.g., via child_process.exec, shell execution functions).
Code Injection

Identify uses of dangerous functions like eval(), new Function(), or any dynamic code evaluation that uses user-supplied data.
Cross-Site Scripting (XSS)

Search for unsanitized data being output into HTML. Include both server‑side and client‑side (DOM-based) vulnerabilities.
Server-Side Template Injection (SSTI)

Examine template engine usage (e.g., in Node.js, Python, or Java frameworks) for unsanitized interpolation that could allow code execution.
Path Traversal/Directory Traversal

Look for file operations where user inputs build file paths without proper sanitization, enabling directory traversal.
II. Authentication & Authorization Issues
Hard-Coded Credentials/Secrets

Identify any API keys, passwords, tokens, cryptographic keys, or other secrets embedded directly in the code.
Weak or Insecure Password Storage

Search for plaintext password handling or use of outdated/weak hashing algorithms.
Session Management Flaws

Verify that session tokens are properly secured, cookies have secure flags, and session timeouts are enforced.
Broken Access Controls

Ensure that authorization checks are consistently applied and that privilege escalation paths (or insecure endpoints) are not present.
III. Data Exposure & Information Leakage
Verbose Error Messages & Stack Traces

Flag any code that might reveal detailed internal error information or stack traces in production.
Sensitive Data in Logs

Look for logging of sensitive data such as credentials, personally identifiable information (PII), or internal configuration details.
Inadvertent Information Disclosure in Comments/Docs

Detect comments or documentation that reveal internal architecture details, debug instructions, or leftover test data.
IV. Cryptography Issues
Weak or Outdated Cryptographic Algorithms

Identify use of deprecated algorithms (e.g., MD5, SHA1, DES, RC4) and non-standard implementations.
Hard-Coded Cryptographic Keys/IVs

Search for any cryptographic keys or initialization vectors that are hard-coded rather than securely managed.
Insecure Random Number Generation

Flag instances where predictable or non-cryptographically secure random number generators are used.
Missing or Incorrect Use of Encryption

Ensure that sensitive data isn’t transmitted or stored without proper encryption, as defined in the codebase.
V. Dependency & Library Vulnerabilities
Outdated Dependencies with Known Vulnerabilities

Analyze package manifests (like package.json, requirements.txt, pom.xml, etc.) for libraries with known CVEs.
Integrate with vulnerability databases (e.g., npm audit, Snyk, OSS Index).
Untrusted or Malicious Third-Party Code

Identify any direct inclusion of code from unverified sources or modules that could be injection points.
VI. Insecure File & Resource Handling
Insecure File Upload Handling

Check file upload code for proper file type validation, size limits, and safe storage practices.
Arbitrary File Inclusion or Require Statements

Look for patterns where user input may determine which file is loaded or executed.
Improper File/Path Manipulation

Identify unsanitized file system operations that could lead to arbitrary file reads/writes.
VII. API & Endpoint Vulnerabilities
Inadequate Input Validation on API Endpoints

Ensure that API routes validate and sanitize all incoming data.
Exposed or Unprotected Endpoints

Detect endpoints that lack proper authentication, authorization, or rate limiting, potentially exposing sensitive operations.
Poor Error Handling in APIs

Verify that APIs do not reveal internal logic or sensitive details through error responses.
VIII. Configuration & Deployment Flaws
Hard-Coded Configuration Values

Look for fixed values (e.g., database URLs, port numbers, debug flags) that should be environment‑controlled.
Insecure Default Configurations

Identify defaults that might be insecure (e.g., debug mode enabled in production).
Exposure of Environment Variables

Check for accidental inclusion of environment configuration files (.env) or similar sensitive data in the codebase.
Build & Deployment Scripts

Scrutinize scripts (e.g., Dockerfiles, CI/CD configs) for embedded credentials or insecure practices.
IX. Usage of Dangerous Functions & Patterns
Dynamic Code Loading & Reflection

Detect dangerous uses of dynamic module loading, reflection APIs, or patterns that bypass static analysis.
Insecure Use of JSONP or CORS Settings

Check for JSONP endpoints or overly permissive CORS configurations directly embedded in the code.
Unsafe Handling of Asynchronous Code

In JavaScript/Node.js: Look for race conditions, unhandled promise rejections, or improper callback use that could be exploited.
Excessive Use of Eval or Similar Constructs

Beyond obvious injection risks, flag any patterns that might make the codebase difficult to secure or audit.
X. Memory & Resource Management (For Lower-Level Languages)
Buffer Overflows & Memory Safety Issues

In C/C++ or similar languages, detect use of unsafe functions (e.g., strcpy, sprintf) and improper memory allocations.
Race Conditions & Concurrency Flaws

Identify code where improper locking or resource sharing could lead to vulnerabilities, particularly in multi-threaded environments.
Resource Leaks That Could Lead to Denial-of-Service (DoS)

Look for code that improperly manages memory, file handles, or network sockets.
XI. Business Logic & Application-Specific Vulnerabilities
Flawed Business Logic

Review critical flows for logical errors that might allow misuse (e.g., bypassing payment, unauthorized data access).
Inconsistent State Management or Transaction Issues

Check for non-atomic operations that might allow state inconsistencies or abuse.
Abuse of Functionality

Identify functions that could be misused in unexpected ways (e.g., endpoints that trigger expensive computations without safeguards).
XII. Language/Framework-Specific Issues
Node.js/JavaScript-Specific Vulnerabilities

In addition to general injection flaws, examine use of Node’s child_process (especially with unsanitized input), improper handling of asynchronous flows, and insecure module imports.
Python-Specific Vulnerabilities

Look for insecure uses of pickle, eval, or unsafe default configurations in frameworks like Django/Flask.
Java/Java-like Vulnerabilities

Check for insecure deserialization, misuse of reflection, and default serialization settings that could be exploited.
Other Languages

Adapt the above principles to any language-specific vulnerabilities (e.g., Swift, Ruby, PHP), ensuring that common pitfalls and deprecated functions are flagged.
XIII. Modern & Emerging Areas
Container & Serverless Code Issues

Even if the scan is internal, review Dockerfiles, Kubernetes manifests, and serverless function code for insecure practices, such as excessive privileges or misconfigured runtime environments.
GraphQL Vulnerabilities

In GraphQL endpoints, ensure resolvers validate inputs and do not expose excessive internal data.
Microservices Communication

Check for insecure service-to-service calls, missing validation on inter-service APIs, and improper use of message brokers or RPC mechanisms.
Smart Contract Code (if applicable)

For projects including blockchain elements (e.g., Solidity code), include checks for reentrancy, integer overflows/underflows, and other common smart contract vulnerabilities.
Machine Learning & Data Pipelines

If your codebase integrates ML components, look for potential poisoning vectors, insecure model loading, or unvalidated user data that feeds into the model.
XIV. Secure Coding Practices & Code Quality
Code Smells & Anomalies

Detect unusual or obfuscated code patterns that might hide vulnerabilities or malicious backdoors.
Unused or Deprecated Code

Flag code that is no longer maintained or commented out debugging functionality that could introduce security risks if reactivated.
Security Annotations & TODOs

Review inline comments for “TODO” or “FIXME” notes related to security, which might indicate known issues.
Adherence to Security Standards

Ensure that the code follows secure coding guidelines like the OWASP Top 10, SANS/CWE recommendations, and industry-specific best practices.
Automated Testing & Static Analysis

Verify that unit/integration tests cover security-critical functionality and that static analysis tools (linters, SAST scanners) are integrated into the codebase.
Error & Exception Handling

Confirm that error handling does not leak internal state or stack traces and that all exceptions are caught and handled securely.
XV. Final Considerations
Documentation and Comments
Check for hardcoded internal URLs, credentials, or debug configurations left in documentation or comments.
Build Artifacts and Developer Tools
Ensure that build scripts or development-only endpoints (debug modes, test hooks) are disabled or removed in production code.
Version Control Artifacts
Scan for accidentally committed sensitive files such as .env, configuration files, or sample data containing secrets.
Dynamic Configuration & Feature Flags
Validate that feature toggles and dynamic configurations do not inadvertently expose insecure code paths when activated.
This list combines long‑standing vulnerabilities (such as injection flaws and improper error handling) with modern concerns (like container security, GraphQL, and serverless patterns) as well as language‐ and framework‑specific issues. It’s meant to serve as a robust checklist for your AI swarm to parse and flag potential vulnerabilities embedded directly in a codebase.

Implementing these checks will help ensure that your “butterfly run” command delivers comprehensive, actionable security insights to developers.
