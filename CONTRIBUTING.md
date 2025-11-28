# Contributing to Spades

Thank you for your interest in contributing to the Spades project! This document provides guidelines and instructions for contributing.

---

## Code of Conduct

### Our Standards

- **Be respectful**: Treat all contributors with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be constructive**: Provide helpful feedback and suggestions
- **Be professional**: Maintain a professional and positive environment

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or inflammatory remarks
- Personal attacks or insults
- Any other conduct that could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 20.0 or higher
- npm 10.0 or higher
- Git
- Basic knowledge of TypeScript, React, and Next.js

### Development Setup

1. **Fork the repository**

2. **Clone your fork:**
   ```bash
   git clone https://github.com/yourusername/spades.git
   cd spades
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(ai): add card counting to hard difficulty
fix(rules): correct spades breaking validation
docs(api): update endpoint documentation
```

### Code Style

#### TypeScript

- Use full type annotations (no `any`)
- Follow Google TypeScript Style Guide
- Use interfaces for object shapes
- Use types for unions and intersections

#### React

- Use functional components with hooks
- Memoize expensive computations
- Extract reusable logic to custom hooks
- Use `memo()` for components that receive stable props

#### File Organization

```
src/
├── app/          # Next.js pages and API routes
├── components/   # React components
│   ├── game/    # Game-specific
│   ├── svg/     # SVG graphics
│   └── ui/      # Reusable UI
├── hooks/        # Custom React hooks
└── lib/          # Core libraries
    └── game/     # Game engine
```

### Testing

While formal tests are not yet implemented, ensure:

1. **Manual testing:**
   - Test your changes in the browser
   - Verify game logic works correctly
   - Check for console errors

2. **Edge cases:**
   - Test with different difficulty levels
   - Test Nil and Blind Nil scenarios
   - Test bag penalties

3. **Browser compatibility:**
   - Test in Chrome/Edge
   - Test in Firefox
   - Test in Safari (if possible)

---

## Contribution Areas

### Game Engine

**Location:** `src/lib/game/`

- Add new game rules
- Improve AI strategies
- Enhance scoring logic
- Optimize performance

### UI Components

**Location:** `src/components/`

- Create new components
- Improve animations
- Enhance accessibility
- Add responsive design

### API

**Location:** `src/app/api/`

- Add new endpoints
- Improve error handling
- Add request validation
- Enhance rate limiting

### Documentation

**Location:** `doc/`

- Update existing docs
- Add new guides
- Improve examples
- Fix typos

---

## Pull Request Process

### Before Submitting

1. **Update documentation:**
   - Update relevant `.md` files
   - Add JSDoc comments to new functions
   - Update CHANGELOG.md if needed

2. **Run linter:**
   ```bash
   npm run lint
   ```

3. **Build successfully:**
   ```bash
   npm run build
   ```

4. **Test your changes:**
   - Manual testing
   - Check for regressions
   - Verify edge cases

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Changes tested locally
- [ ] CHANGELOG.md updated (if applicable)

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #issue-number
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Thank you for contributing!

---

## Reporting Issues

### Bug Reports

Use the GitHub issue template and include:

- **Description**: Clear description of the bug
- **Steps to reproduce**: Detailed steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, Node version
- **Screenshots**: If applicable

### Feature Requests

Include:

- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Additional context**: Any other relevant information

---

## Code Review Guidelines

### For Contributors

- Be open to feedback
- Respond to comments promptly
- Make requested changes
- Ask questions if unclear

### For Reviewers

- Be constructive and respectful
- Explain reasoning for suggestions
- Approve when satisfied
- Thank contributors for their work

---

## Questions?

- Open a GitHub issue with the `question` label
- Check existing documentation in `/doc`
- Review closed issues for similar questions

---

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

*Contributing Guide Version: 1.0.0*
*Last Updated: November 2024*

