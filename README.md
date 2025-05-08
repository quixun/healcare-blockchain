# Healthcare Blockchain Project

This project is a decentralized healthcare application built with React, TypeScript, and Vite, integrated with blockchain technology using Hardhat.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Smart Contracts**: Solidity + Hardhat
- **Styling**: Tailwind CSS
- **Development Tools**: ESLint, TypeScript

## Project Structure

```
├── contracts/     # Smart contract source files
├── src/          # React application source
├── scripts/      # Deployment and utility scripts
├── public/       # Static assets
└── artifacts/    # Compiled smart contracts
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Compile smart contracts:
```bash
npx hardhat compile
```

4. Run tests:
```bash
npx hardhat test
```

## Development

The project uses several official plugins:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) for SWC-based Fast Refresh

## ESLint Configuration

The project uses a type-aware ESLint configuration. The configuration can be found in `eslint.config.js` and includes:

- TypeScript-specific rules
- React-specific rules
- Stylistic rules

## Smart Contract Development

The project uses Hardhat for smart contract development. Configuration can be found in `hardhat.config.cjs`.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.

## Git Workflow

### Repository Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/healcare-block-chain.git
cd healcare-block-chain
```

2. Set up your remote:
```bash
git remote add origin https://github.com/your-username/healcare-block-chain.git
```

### Branch Management

- `main` - Production-ready code
- `develop` - Development branch for features
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Urgent production fixes

### Development Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git add .
git commit -m "feat: description of your changes"
```

3. Push your changes:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request from your feature branch to `develop`

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks

Example:
```bash
git commit -m "feat: add patient registration functionality"
git commit -m "fix: resolve smart contract deployment issue"
```

### Git Hooks

The project includes pre-commit hooks to ensure code quality:
- ESLint checks
- TypeScript type checking
- Prettier formatting

### Common Git Commands

```bash
# Update your local repository
git pull origin develop

# Check branch status
git status

# View commit history
git log --oneline

# Stash changes
git stash
git stash pop

# Reset to a specific commit
git reset --hard <commit-hash>
```

### Troubleshooting

1. If you encounter merge conflicts:
```bash
git fetch origin
git merge origin/develop
# Resolve conflicts manually
git add .
git commit -m "merge: resolve conflicts"
```

2. To undo the last commit:
```bash
git reset --soft HEAD~1
```

3. To clean untracked files:
```bash
git clean -fd
```
