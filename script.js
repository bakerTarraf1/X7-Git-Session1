// Scrollable presentation with custom terminal
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing presentation');
    
    // Make all slides visible
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
        slide.style.display = 'block';
    });
    
    // Hide navigation and counter since we're using scroll
    const navigation = document.querySelector('.navigation');
    const counter = document.querySelector('.slide-counter');
    if (navigation) navigation.style.display = 'none';
    if (counter) counter.style.display = 'none';

    // Initialize all terminals immediately
    initializeAllTerminals();
});

// Initialize all terminals on page load
function initializeAllTerminals() {
    console.log('Initializing all terminals');
    
    // Initialize all interactive terminals immediately
    const interactiveTerminals = document.querySelectorAll('.interactive-terminal');
    console.log('Found', interactiveTerminals.length, 'interactive terminals');
    
    interactiveTerminals.forEach((terminal, index) => {
        console.log('Setting up terminal', index + 1);
        initializeCustomTerminal(terminal);
    });
    
    // Also set up direct event listeners as fallback
    const allInputs = document.querySelectorAll('.terminal-input');
    console.log('Found', allInputs.length, 'terminal inputs');
    
    allInputs.forEach((input, index) => {
        console.log('Setting up direct event listener for input', index + 1);
        
        input.addEventListener('keypress', function(e) {
            console.log('Direct keypress event:', e.key);
            if (e.key === 'Enter') {
                const command = this.value.trim();
                console.log('Direct enter event, command:', command);
                
                if (command) {
                    // Find the output area for this input
                    const terminal = this.closest('.interactive-terminal');
                    const outputArea = terminal ? terminal.querySelector('.terminal-output-area') : null;
                    
                    if (outputArea) {
                        executeCustomCommand(command, outputArea);
                        this.value = '';
                    } else {
                        console.error('Could not find output area');
                    }
                }
            }
        });
    });
    
    // Initialize tabs and clickable commands
    const terminalContainers = document.querySelectorAll('.terminal');
    terminalContainers.forEach((terminal, index) => {
        initializeTabs(terminal, index);
        initializeClickableCommands(terminal);
    });
}

function initializeTabs(terminal, terminalIndex) {
    const tabs = terminal.querySelectorAll('.terminal-tab');
    const terminalContent = terminal.querySelector('.terminal-content');
    const demoContent = terminal.querySelector('#demo' + (terminalIndex + 1));
    const interactiveContent = terminal.querySelector('#interactive' + (terminalIndex + 1));
    
    if (!tabs.length || !terminalContent || !demoContent || !interactiveContent) {
        console.log('Missing tab elements for terminal', terminalIndex + 1);
        return;
    }
    
    // Make sure terminal content wrapper is visible
    terminalContent.classList.add('active');
    
    // Set initial state: show demo, hide interactive
    demoContent.style.display = 'block';
    interactiveContent.style.display = 'none';
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            console.log('Tab clicked:', index === 0 ? 'Demo' : 'Try It', 'for terminal', terminalIndex + 1);
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show/hide content based on tab
            if (index === 0) {
                // Show demo content, hide interactive
                demoContent.style.display = 'block';
                interactiveContent.style.display = 'none';
            } else {
                // Show interactive content, hide demo
                demoContent.style.display = 'none';
                interactiveContent.style.display = 'block';
                
                // Focus the input if it exists
                const input = interactiveContent.querySelector('.terminal-input');
                if (input) {
                    setTimeout(() => input.focus(), 100);
                }
            }
        });
    });
}

function initializeCustomTerminal(container) {
    console.log('Initializing custom terminal for container:', container);
    
    const input = container.querySelector('.terminal-input');
    const outputArea = container.querySelector('.terminal-output-area');
    
    console.log('Input element:', input);
    console.log('Output area:', outputArea);
    
    if (!input || !outputArea) {
        console.error('Missing input or output area elements');
        return;
    }
    
    // Check if already initialized
    if (input.dataset.initialized) {
        console.log('Terminal already initialized');
        return;
    }
    input.dataset.initialized = 'true';
    
    console.log('Setting up terminal...');
    
    // Show welcome message
    addTerminalOutput(outputArea, 'Welcome to Git Terminal! Type "help" for available commands.', 'info');
    
    // Focus input
    input.focus();
    
    // Handle input
    input.addEventListener('keypress', function(e) {
        console.log('Key pressed:', e.key);
        if (e.key === 'Enter') {
            const command = this.value.trim();
            console.log('Enter pressed, command:', command);
            if (command) {
                executeCustomCommand(command, outputArea);
                this.value = '';
            }
        }
    });
    
    // Keep focus on input
    container.addEventListener('click', () => {
        console.log('Container clicked, focusing input');
        input.focus();
    });
    
    console.log('Terminal initialization complete');
}

function executeCustomCommand(command, outputArea) {
    console.log('Executing command:', command);
    
    // Add command to output
    addTerminalOutput(outputArea, '$ ' + command, 'command');
    
    // Handle special commands
    if (command === 'clear') {
        outputArea.innerHTML = '';
        addTerminalOutput(outputArea, 'Welcome to Git Terminal! Type "help" for available commands.', 'info');
        return;
    }
    
    if (command === 'help') {
        const helpText = `Available Git commands:
git init                 - Initialize a new repository
git status              - Check repository status  
git add <file>          - Stage files for commit
git add .               - Stage all changes
git commit -m "msg"     - Commit staged changes
git log                 - View commit history
git branch              - List branches
git checkout <branch>   - Switch branches
git merge <branch>      - Merge branches
git remote add origin <url> - Add remote repository
git push origin main    - Push to remote
git pull origin main    - Pull from remote
git clone <url>         - Clone repository
git diff                - Show changes
git stash               - Stash changes
git tag v1.0.0          - Create tag
clear                   - Clear terminal

Examples:
git init
git add index.html
git commit -m "Initial commit"
git status

You can also use commands without 'git' prefix:
init, status, add, commit, log, branch, etc.`;
        addTerminalOutput(outputArea, helpText, 'result');
        return;
    }
    
    // Handle git commands (with or without git prefix)
    let gitCommand = command;
    if (!command.startsWith('git ') && isGitCommand(command)) {
        gitCommand = 'git ' + command;
    }
    
    console.log('Git command to execute:', gitCommand);
    
    // Try dynamic command parsing first
    let output = parseGitCommand(gitCommand);
    
    // If no dynamic parsing match, try static command database
    if (!output) {
        output = getCommandOutput(gitCommand);
    }
    
    console.log('Command output:', output);
    
    if (output) {
        addTerminalOutput(outputArea, output, 'result');
    } else {
        addTerminalOutput(outputArea, 'Command not recognized. Type "help" for available commands.', 'error');
    }
    
    // Scroll to bottom
    outputArea.scrollTop = outputArea.scrollHeight;
}

function parseGitCommand(command) {
    // Handle dynamic git config commands
    if (command.startsWith('git config --global user.name ')) {
        const name = command.replace('git config --global user.name ', '').replace(/"/g, '');
        return `User name set to: ${name}`;
    }
    
    if (command.startsWith('git config --global user.email ')) {
        const email = command.replace('git config --global user.email ', '').replace(/"/g, '');
        return `User email set to: ${email}`;
    }
    
    if (command.startsWith('git config --global core.editor ')) {
        const editor = command.replace('git config --global core.editor ', '').replace(/"/g, '');
        return `Default editor set to: ${editor}`;
    }
    
    if (command.startsWith('git config user.name ')) {
        const name = command.replace('git config user.name ', '').replace(/"/g, '');
        return `User name set to: ${name}`;
    }
    
    if (command.startsWith('git config user.email ')) {
        const email = command.replace('git config user.email ', '').replace(/"/g, '');
        return `User email set to: ${email}`;
    }
    
    // Handle git add with specific files
    if (command.startsWith('git add ') && command !== 'git add .' && command !== 'git add' && command !== 'git add -A' && command !== 'git add --all' && command !== 'git add -p') {
        const files = command.replace('git add ', '');
        return `Added '${files}' to staging area`;
    }
    
    // Handle git commit with dynamic messages
    if (command.startsWith('git commit -m ') && !getCommandOutput(command)) {
        const message = command.replace('git commit -m ', '').replace(/"/g, '');
        const commitHash = Math.random().toString(36).substr(2, 7);
        return `[main ${commitHash}] ${message}\n 1 file changed, 3 insertions(+)`;
    }
    
    // Handle git branch creation with custom names
    if (command.startsWith('git branch ') && command !== 'git branch' && command !== 'git branch -a' && command !== 'git branch -r' && command !== 'git branch -l') {
        const branchName = command.replace('git branch ', '');
        if (branchName.startsWith('-d ') || branchName.startsWith('-D ')) {
            const deleteBranch = branchName.replace(/^-[dD] /, '');
            const commitHash = Math.random().toString(36).substr(2, 7);
            return `Deleted branch ${deleteBranch} (was ${commitHash}).`;
        }
        return `Created branch '${branchName}'`;
    }
    
    // Handle git checkout with custom branch names
    if (command.startsWith('git checkout ') && !getCommandOutput(command)) {
        const target = command.replace('git checkout ', '');
        if (target.startsWith('-b ')) {
            const newBranch = target.replace('-b ', '');
            return `Switched to a new branch '${newBranch}'`;
        }
        return `Switched to branch '${target}'`;
    }
    
    // Handle git merge with custom branch names
    if (command.startsWith('git merge ') && !getCommandOutput(command)) {
        const branch = command.replace('git merge ', '');
        const oldHash = Math.random().toString(36).substr(2, 7);
        const newHash = Math.random().toString(36).substr(2, 7);
        return `Updating ${oldHash}..${newHash}\nFast-forward\n 1 file changed, 5 insertions(+)`;
    }
    
    // Handle git tag with custom names
    if (command.startsWith('git tag ') && command !== 'git tag' && command !== 'git tag -l') {
        const tagName = command.replace('git tag ', '').split(' ')[0];
        return `Created tag '${tagName}'`;
    }
    
    return null;
}

function isGitCommand(command) {
    const gitCommands = ['init', 'status', 'add', 'commit', 'log', 'branch', 'checkout', 'merge', 'push', 'pull', 'clone', 'diff', 'stash', 'tag', 'remote'];
    const firstWord = command.split(' ')[0];
    return gitCommands.includes(firstWord);
}

function addTerminalOutput(outputArea, text, type) {
    console.log('Adding terminal output:', text, 'Type:', type);
    
    const line = document.createElement('div');
    line.className = 'terminal-output-line';
    
    if (type === 'command') {
        line.className += ' terminal-command-line';
    } else if (type === 'result') {
        line.className += ' terminal-result';
    } else if (type === 'error') {
        line.className += ' terminal-error';
    }
    
    line.textContent = text;
    outputArea.appendChild(line);
    
    console.log('Line added to output area');
}

// Clickable commands functionality (for Demo tabs)
function initializeClickableCommands(terminal) {
    const commands = terminal.querySelectorAll('.terminal-command');
    
    commands.forEach(command => {
        command.style.cursor = 'pointer';
        command.addEventListener('click', function() {
            executeCommand(this, terminal);
        });
    });
}

function executeCommand(commandElement, terminal) {
    const command = commandElement.textContent.trim();
    const outputElement = commandElement.parentElement.querySelector('.terminal-output');
    
    // Simulate command execution with realistic delays
    commandElement.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
    
    setTimeout(() => {
        outputElement.style.display = 'block';
        
        // Get command output and display with typing effect
        const output = getCommandOutput(command);
        if (output) {
            typeText(outputElement, output);
        }
    }, 300);
    
    setTimeout(() => {
        commandElement.style.backgroundColor = '';
    }, 500);
}

function typeText(element, text) {
    if (!text) {
        text = 'Command not recognized. Type "help" for available commands.';
    }
    
    element.textContent = '';
    let i = 0;
    const speed = 30; // Typing speed in milliseconds
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

function initializeTabs(terminal, terminalIndex) {
    const tabs = terminal.querySelectorAll('.terminal-tab');
    const terminalContent = terminal.querySelector('.terminal-content');
    const demoContent = terminal.querySelector('#demo' + (terminalIndex + 1));
    const interactiveContent = terminal.querySelector('#interactive' + (terminalIndex + 1));
    
    if (!tabs.length || !terminalContent || !demoContent || !interactiveContent) {
        console.log('Missing elements for terminal', terminalIndex + 1);
        return;
    }
    
    // Make sure terminal content wrapper is visible
    terminalContent.classList.add('active');
    
    // Set initial state: show demo, hide interactive
    demoContent.style.display = 'block';
    interactiveContent.style.display = 'none';
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show/hide content based on tab
            if (index === 0) {
                // Show demo content, hide interactive
                demoContent.style.display = 'block';
                interactiveContent.style.display = 'none';
            } else {
                // Show interactive content, hide demo
                demoContent.style.display = 'none';
                interactiveContent.style.display = 'block';
            }
        });
    });
}

function initializeInteractiveTerminal(terminal, terminalIndex) {
    const interactiveContent = terminal.querySelector('.interactive-terminal');
    if (!interactiveContent) return;
    
    const input = interactiveContent.querySelector('.terminal-input');
    const output = interactiveContent.querySelector('.terminal-output');
    
    if (!input || !output) return;
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const command = this.value.trim();
            if (command) {
                executeInteractiveCommand(command, output, terminalIndex);
                this.value = '';
            }
        }
    });
    
    // Focus input when tab is clicked
    input.focus();
}

function executeInteractiveCommand(command, outputElement, terminalIndex) {
    if (!outputElement) {
        console.error('Output element not found for terminal', terminalIndex);
        return;
    }
    
    // Handle special commands
    if (command === 'clear') {
        outputElement.innerHTML = '';
        return;
    }
    
    // Add command to output
    const commandLine = document.createElement('div');
    commandLine.innerHTML = `<span style="color: #4CAF50;">$ </span><span style="color: #fff;">${command}</span>`;
    commandLine.style.marginBottom = '5px';
    outputElement.appendChild(commandLine);
    
    // Get and display output
    const output = getCommandOutput(command);
    if (output && output !== 'CLEAR_TERMINAL') {
        const outputLine = document.createElement('div');
        outputLine.style.color = '#e2e8f0';
        outputLine.style.marginLeft = '10px';
        outputLine.style.marginBottom = '10px';
        outputLine.style.whiteSpace = 'pre-line';
        outputLine.textContent = output;
        outputElement.appendChild(outputLine);
    }
    
    // Scroll to bottom
    outputElement.scrollTop = outputElement.scrollHeight;
}

function executeCommand(commandElement, terminal) {
    const command = commandElement.textContent.trim();
    const outputElement = commandElement.parentElement.querySelector('.terminal-output');
    
    // Simulate command execution with realistic delays
    commandElement.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
    
    setTimeout(() => {
        // Show output based on command
        if (outputElement) {
            outputElement.style.display = 'block';
            typeText(outputElement, getCommandOutput(command));
        }
        commandElement.style.backgroundColor = '';
    }, 500);
}

function typeText(element, text) {
    if (!text) {
        text = 'Command not recognized. Type "help" for available commands.';
    }
    
    element.textContent = '';
    let i = 0;
    const speed = 30; // Typing speed in milliseconds
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

function getCommandOutput(command) {
    const outputs = {
        // Git main help commands
        'git': `usage: git [--version] [--help] [-C <path>] [<command> [<args>]]

The most commonly used git commands are:
   init        Create an empty Git repository
   add         Add file contents to the index
   commit      Record changes to the repository
   status      Show the working tree status
   log         Show commit logs
   branch      List, create, or delete branches
   checkout    Switch branches or restore files
   merge       Join two or more development histories
   remote      Manage remote repository connections
   push        Update remote refs along with associated objects
   pull        Fetch from and integrate with another repository
   clone       Clone a repository into a new directory
   diff        Show changes between commits, commit and working tree, etc
   stash       Stash the changes in a dirty working directory
   tag         Create, list, delete or verify a tag object

'git help <command>' for more information on a specific command.
Type 'help' for a list of available commands in this terminal.`,

        'git --help': `usage: git [--version] [--help] [-C <path>] [<command> [<args>]]

Git is a distributed version control system for tracking changes in source code during software development.

Most commonly used commands:

Start a working area:
   clone     Clone a repository into a new directory
   init      Create an empty Git repository or reinitialize an existing one

Work on the current change:
   add       Add file contents to the index
   mv        Move or rename a file, a directory, or a symlink
   restore   Restore working tree files
   rm        Remove files from the working tree and from the index

Examine the history and state:
   bisect    Use binary search to find the commit that introduced a bug
   diff      Show changes between commits, commit and working tree, etc
   grep      Print lines matching a pattern
   log       Show commit logs
   show      Show various types of objects
   status    Show the working tree status

Grow, mark and tweak your common history:
   branch    List, create, or delete branches
   commit    Record changes to the repository
   merge     Join two or more development histories together
   rebase    Reapply commits on top of another base tip
   reset     Reset current HEAD to the specified state
   switch    Switch branches
   tag       Create, list, delete or verify a tag object

Collaborate:
   fetch     Download objects and refs from another repository
   pull      Fetch from and integrate with another repository or a local branch
   push      Update remote refs along with associated objects

Type 'git help <command>' to learn more about a specific command.`,

        'git help': `Git Help System

For detailed help on any Git command, use:
   git help <command>    - Show detailed help for a command
   git <command> -h      - Show brief help for a command

Examples:
   git help init         - Detailed help for git init
   git init -h           - Brief help for git init
   
Common help topics:
   git help config       - Configuration options
   git help glossary     - Git terminology
   git help tutorial     - Basic Git tutorial
   git help workflows    - Git workflows

In this terminal, type 'help' to see available commands.`,

        // Version and config
        'git --version': 'git version 2.41.0 (Apple Git-144)',
        'git version': 'git version 2.41.0 (Apple Git-144)',
        'git config --list': 'user.name=Your Name\nuser.email=your@email.com\ncore.editor=code --wait\ninit.defaultbranch=main\ncore.autocrlf=input\ncore.safecrlf=warn\npush.default=simple',
        'git config --global --list': 'user.name=Your Name\nuser.email=your@email.com\ncore.editor=code --wait\ninit.defaultbranch=main',
        'git config user.name': 'Your Name',
        'git config user.email': 'your@email.com',
        'git config --global user.name "bob"': '',
        'git config --global user.name "alice"': '',
        'git config --global user.name "john"': '',
        'git config --global user.name "jane"': '',
        'git config --global user.email "bob@example.com"': '',
        'git config --global user.email "alice@example.com"': '',
        'git config --global user.email "john@example.com"': '',
        'git config --global user.email "jane@example.com"': '',
        'git config --global core.editor "code --wait"': '',
        'git config --global core.editor "vim"': '',
        'git config --global core.editor "nano"': '',
        'git config --global init.defaultBranch main': '',
        'git config --global init.defaultBranch master': '',

        // Repository initialization
        'git init': 'Initialized empty Git repository in /current/directory/.git/',
        'git init .': 'Initialized empty Git repository in /current/directory/.git/',
        'git init myproject': 'Initialized empty Git repository in /current/directory/myproject/.git/',

        // Status commands
        'git status': 'On branch main\nNothing to commit, working tree clean',
        'git status --short': '?? newfile.txt\nM  index.html\nA  style.css',
        'git status -s': '?? newfile.txt\nM  index.html\nA  style.css',

        // Add commands
        'git add .': '',
        'git add': '',
        'git add -A': '',
        'git add --all': '',
        'git add index.html': '',
        'git add *.html': '',
        'git add -p': 'diff --git a/index.html b/index.html\nStage this hunk [y,n,q,a,d,s,e,?]?',

        // Commit commands
        'git commit': '[main abc123] Your commit message\n 2 files changed, 12 insertions(+), 3 deletions(-)',
        'git commit -m "Initial commit"': '[main (root-commit) abc123] Initial commit\n 3 files changed, 45 insertions(+)\n create mode 100644 index.html\n create mode 100644 style.css\n create mode 100644 script.js',
        'git commit -m "Add new feature"': '[main def456] Add new feature\n 2 files changed, 8 insertions(+), 1 deletion(-)',
        'git commit -am "Quick commit"': '[main ghi789] Quick commit\n 1 file changed, 3 insertions(+)',
        'git commit --amend': '[main abc123] Updated commit message\n Date: Thu Oct 10 2025 10:30:00',

        // Log commands
        'git log': 'commit abc123def456 (HEAD -> main)\nAuthor: Your Name <your@email.com>\nDate: Thu Oct 10 2025 10:30:00\n\n    Initial commit\n\ncommit def456ghi789\nAuthor: Your Name <your@email.com>\nDate: Wed Oct 9 2025 15:45:00\n\n    Add new feature',
        'git log --oneline': 'abc123 Initial commit\ndef456 Add new feature\nghi789 Fix bug in login\njkl012 Update documentation',
        'git log --graph': '* abc123 (HEAD -> main) Initial commit\n* def456 Add new feature\n* ghi789 Fix bug in login',
        'git log -p': 'commit abc123def456 (HEAD -> main)\nAuthor: Your Name <your@email.com>\nDate: Thu Oct 10 2025 10:30:00\n\n    Initial commit\n\ndiff --git a/index.html b/index.html\nnew file mode 100644\nindex 0000000..abc123\n--- /dev/null\n+++ b/index.html',
        'git log --stat': 'commit abc123def456 (HEAD -> main)\nAuthor: Your Name <your@email.com>\nDate: Thu Oct 10 2025 10:30:00\n\n    Initial commit\n\n index.html | 10 ++++++++++\n style.css  |  5 +++++\n 2 files changed, 15 insertions(+)',

        // Branch commands
        'git branch': '* main\n  feature/login\n  feature/dashboard',
        'git branch -a': '* main\n  feature/login\n  feature/dashboard\n  remotes/origin/main\n  remotes/origin/develop',
        'git branch -r': '  origin/main\n  origin/develop\n  origin/feature/api',
        'git branch feature/new-feature': '',
        'git branch -d feature/old-feature': 'Deleted branch feature/old-feature (was abc123).',
        'git branch -D feature/force-delete': 'Deleted branch feature/force-delete (was def456).',

        // Checkout commands
        'git checkout main': 'Switched to branch \'main\'',
        'git checkout feature/new-feature': 'Switched to branch \'feature/new-feature\'',
        'git checkout -b feature/login': 'Switched to a new branch \'feature/login\'',
        'git checkout -- index.html': '',
        'git checkout HEAD~1': 'Note: switching to \'HEAD~1\'.\nYou are in \'detached HEAD\' state.',

        // Merge commands
        'git merge feature/new-feature': 'Updating abc123..def456\nFast-forward\n index.html | 10 ++++++++++\n 1 file changed, 10 insertions(+)',
        'git merge --no-ff feature/login': 'Merge made by the \'recursive\' strategy.\n login.html | 15 +++++++++++++++\n 1 file changed, 15 insertions(+)',

        // Remote commands
        'git remote': 'origin',
        'git remote -v': 'origin\thttps://github.com/user/repo.git (fetch)\norigin\thttps://github.com/user/repo.git (push)',
        'git remote add origin <url>': '',
        'git remote add origin https://github.com/user/repo.git': '',
        'git remote show origin': '* remote origin\n  Fetch URL: https://github.com/user/repo.git\n  Push  URL: https://github.com/user/repo.git\n  HEAD branch: main\n  Remote branches:\n    main tracked\n    develop tracked',

        // Push/Pull commands
        'git push': 'Everything up-to-date',
        'git push origin main': 'Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nCompressing objects: 100% (3/3), done.\nWriting objects: 100% (3/3), 356 bytes | 356.00 KiB/s, done.\nTotal 3 (delta 1), reused 0 (delta 0)\nTo github.com:username/repository.git\n   abc123..def456  main -> main',
        'git push -u origin main': 'Branch \'main\' set up to track remote branch \'main\' from \'origin\'.\nEverything up-to-date',
        'git pull': 'Already up to date.',
        'git pull origin main': 'From github.com:username/repository\n * branch            main     -> FETCH_HEAD\nAlready up to date.',
        'git fetch': 'remote: Enumerating objects: 3, done.\nremote: Counting objects: 100% (3/3), done.\nremote: Total 3 (delta 0), reused 0 (delta 0)\nUnpacking objects: 100% (3/3), done.',

        // Clone commands
        'git clone <url>': 'Cloning into \'repository\'...\nremote: Enumerating objects: 100, done.\nremote: Counting objects: 100% (100/100), done.\nremote: Compressing objects: 100% (65/65), done.\nReceiving objects: 100% (100/100), 15.32 KiB | 1.70 MiB/s, done.\nResolving deltas: 100% (35/35), done.',

        // Diff commands
        'git diff': 'diff --git a/index.html b/index.html\nindex abc123..def456 100644\n--- a/index.html\n+++ b/index.html\n@@ -1,3 +1,4 @@\n <!DOCTYPE html>\n <html>\n+<head><title>My Site</title></head>\n <body>',
        'git diff --cached': 'diff --git a/style.css b/style.css\nindex abc123..def456 100644\n--- a/style.css\n+++ b/style.css\n@@ -1,2 +1,3 @@\n body {\n   margin: 0;\n+  padding: 0;\n }',
        'git diff HEAD~1': 'diff --git a/README.md b/README.md\nindex abc123..def456 100644\n--- a/README.md\n+++ b/README.md\n@@ -1 +1,2 @@\n # My Project\n+Description of the project',

        // Stash commands
        'git stash': 'Saved working directory and index state WIP on main: abc123 Initial commit',
        'git stash pop': 'On branch main\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\tmodified:   index.html\n\nno changes added to commit (use "git add" and/or "git commit -a")',
        'git stash list': 'stash@{0}: WIP on main: abc123 Initial commit\nstash@{1}: WIP on feature: def456 Add feature',
        'git stash apply': 'On branch main\nChanges not staged for commit:\n  modified:   index.html',

        // Reset commands
        'git reset': 'Unstaged changes after reset:\nM\tindex.html\nM\tstyle.css',
        'git reset HEAD': 'Unstaged changes after reset:\nM\tindex.html\nM\tstyle.css',
        'git reset HEAD index.html': 'Unstaged changes after reset:\nM\tindex.html',
        'git reset --hard HEAD': 'HEAD is now at abc123 Initial commit',
        'git reset --soft HEAD~1': '',

        // Revert commands
        'git revert abc123': '[main def456] Revert "problematic commit"\n 1 file changed, 5 deletions(-)',
        'git revert HEAD': '[main ghi789] Revert "latest commit"\n 2 files changed, 10 deletions(-)',

        // Tag commands
        'git tag': 'v1.0.0\nv1.0.1\nv1.1.0\nv2.0.0',
        'git tag v1.0.0': '',
        'git tag -a v1.0.0 -m "Version 1.0.0"': '',
        'git tag -l': 'v1.0.0\nv1.0.1\nv1.1.0\nv2.0.0',
        'git show v1.0.0': 'tag v1.0.0\nTagger: Your Name <your@email.com>\nDate: Thu Oct 10 2025 10:30:00\n\nVersion 1.0.0\n\ncommit abc123def456',

        // Show commands
        'git show': 'commit abc123def456 (HEAD -> main)\nAuthor: Your Name <your@email.com>\nDate: Thu Oct 10 2025 10:30:00\n\n    Initial commit\n\ndiff --git a/index.html b/index.html\nnew file mode 100644\nindex 0000000..abc123',
        'git show HEAD': 'commit abc123def456 (HEAD -> main)\nAuthor: Your Name <your@email.com>\nDate: Thu Oct 10 2025 10:30:00\n\n    Initial commit',

        // Other useful commands
        'git reflog': 'abc123 (HEAD -> main) HEAD@{0}: commit: Initial commit\ndef456 HEAD@{1}: commit: Add feature\nghi789 HEAD@{2}: checkout: moving from feature to main',
        'git blame index.html': 'abc123 (Your Name 2025-10-10 10:30:00 +0000 1) <!DOCTYPE html>\ndef456 (Your Name 2025-10-10 11:00:00 +0000 2) <html>\nghi789 (Your Name 2025-10-10 11:30:00 +0000 3) <head>',
        'git shortlog': 'Your Name (3):\n      Initial commit\n      Add new feature\n      Fix bug in login',

        // Terminal help and utilities
        'help': `Available Git commands in this terminal:

SETUP & CONFIG:
   git, git --help           - Show Git help information
   git --version             - Show Git version
   git config --list         - Show Git configuration

REPOSITORY CREATION:
   git init                  - Initialize a new repository
   git clone <url>           - Clone a remote repository

BASIC WORKFLOW:
   git status                - Check repository status
   git add <file>            - Stage files for commit
   git add .                 - Stage all changes
   git commit -m "message"   - Commit staged changes
   git log                   - View commit history

BRANCHING & MERGING:
   git branch                - List branches
   git branch <name>         - Create new branch
   git checkout <branch>     - Switch branches
   git checkout -b <branch>  - Create and switch to branch
   git merge <branch>        - Merge branch

REMOTE REPOSITORIES:
   git remote -v             - Show remote repositories
   git push origin main      - Push to remote
   git pull origin main      - Pull from remote
   git fetch                 - Fetch from remote

ADVANCED:
   git diff                  - Show changes
   git stash                 - Stash changes
   git tag                   - Manage tags
   git reset                 - Reset changes
   git revert                - Revert commits

UTILITIES:
   clear                     - Clear terminal
   ls                        - List files
   pwd                       - Show current directory

Type any command to see its output!`,

        'clear': 'CLEAR_TERMINAL',
        'ls': 'README.md\nindex.html\nstyle.css\nscript.js\n.git/\n.gitignore\npackage.json',
        'ls -la': 'total 24\ndrwxr-xr-x  8 user user  256 Oct 10 10:30 .\ndrwxr-xr-x  3 user user   96 Oct 10 10:00 ..\ndrwxr-xr-x  8 user user  256 Oct 10 10:30 .git\n-rw-r--r--  1 user user   42 Oct 10 10:30 .gitignore\n-rw-r--r--  1 user user 1024 Oct 10 10:30 README.md\n-rw-r--r--  1 user user 2048 Oct 10 10:30 index.html\n-rw-r--r--  1 user user  512 Oct 10 10:30 package.json\n-rw-r--r--  1 user user 1536 Oct 10 10:30 script.js\n-rw-r--r--  1 user user  768 Oct 10 10:30 style.css',
        'pwd': '/Users/developer/my-project',
        'whoami': 'developer',
        'date': 'Thu Oct 10 10:30:00 PDT 2025'
    };
    
    return outputs[command] || 'Command not recognized. Type "help" for available commands.';
}

// Try It Yourself functionality
function tryCommand(command, outputId) {
    const outputElement = document.getElementById(outputId);
    outputElement.style.display = 'block';
    outputElement.innerHTML = `<span style="color: #4CAF50;">$ ${command}</span>\n${getCommandOutput(command)}`;
}