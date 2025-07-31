// Game State
class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'human'; // 'human' or 'ai'
        this.gameActive = true;
        this.scores = { X: 0, O: 0, draws: 0 };
        this.gamesPlayed = 0;
        this.settings = {
            difficulty: 'medium',
            animations: true,
            sounds: true
        };
        
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.loadSettings();
        this.animateTitle();
    }
    
    bindEvents() {
        // Game board clicks
        document.getElementById('gameBoard').addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                const index = parseInt(e.target.dataset.index);
                this.makeMove(index);
            }
        });
        
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setGameMode(e.target.dataset.mode);
            });
        });
        
        // Control buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        
        // Modal events
        document.getElementById('modalClose').addEventListener('click', () => this.hideModal('gameOverModal'));
        document.getElementById('closeModalBtn').addEventListener('click', () => this.hideModal('gameOverModal'));
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.hideModal('gameOverModal');
            this.resetGame();
        });
        
        // Settings modal
        document.getElementById('settingsClose').addEventListener('click', () => this.hideModal('settingsModal'));
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        
        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal('gameOverModal');
                this.hideModal('settingsModal');
            }
            
            // Number keys for quick moves
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                this.makeMove(index);
            }
        });
    }
    
    animateTitle() {
        const letters = document.querySelectorAll('.title-letter');
        letters.forEach((letter, index) => {
            letter.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Update player names
        const playerOName = document.querySelector('.player-o .player-name');
        playerOName.textContent = mode === 'ai' ? 'AI' : 'Player O';
        
        this.resetGame();
    }
    
    makeMove(index) {
        if (!this.gameActive || this.board[index] !== '' || 
            (this.gameMode === 'ai' && this.currentPlayer === 'O')) {
            return;
        }
        
        this.board[index] = this.currentPlayer;
        this.updateCell(index, this.currentPlayer);
        this.createParticles(index);
        
        if (this.checkWinner()) {
            this.endGame(this.currentPlayer);
            return;
        }
        
        if (this.board.every(cell => cell !== '')) {
            this.endGame('draw');
            return;
        }
        
        this.switchPlayer();
        
        // AI move
        if (this.gameMode === 'ai' && this.currentPlayer === 'O' && this.gameActive) {
            setTimeout(() => {
                this.makeAIMove();
            }, 500);
        }
    }
    
    makeAIMove() {
        let move;
        
        switch (this.settings.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getHardMove();
                break;
            case 'impossible':
                move = this.getMinimaxMove();
                break;
            default:
                move = this.getMediumMove();
        }
        
        if (move !== -1) {
            this.makeMove(move);
        }
    }
    
    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        return availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
            : -1;
    }
    
    getMediumMove() {
        // Try to win first
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner() === 'O') {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Block player from winning
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner() === 'X') {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Random move
        return this.getRandomMove();
    }
    
    getHardMove() {
        // Try to win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner() === 'O') {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Block player
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner() === 'X') {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Take center if available
        if (this.board[4] === '') return 4;
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        return this.getRandomMove();
    }
    
    getMinimaxMove() {
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    minimax(board, depth, isMaximizing) {
        const winner = this.checkWinner();
        
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (board.every(cell => cell !== '')) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    updateCell(index, player) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        
        if (this.settings.animations) {
            cell.style.animation = 'none';
            cell.offsetHeight; // Trigger reflow
            cell.style.animation = 'popIn 0.5s ease';
        }
    }
    
    createParticles(index) {
        if (!this.settings.animations) return;
        
        const cell = document.querySelector(`[data-index="${index}"]`);
        const rect = cell.getBoundingClientRect();
        const particles = document.getElementById('particles');
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = rect.left + rect.width / 2 + 'px';
            particle.style.top = rect.top + rect.height / 2 + 'px';
            particle.style.background = this.currentPlayer === 'X' ? '#667eea' : '#f093fb';
            
            const angle = (i * 60) * Math.PI / 180;
            const velocity = 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--vx', vx + 'px');
            particle.style.setProperty('--vy', vy + 'px');
            
            particles.appendChild(particle);
            
            setTimeout(() => {
                particles.removeChild(particle);
            }, 2000);
        }
    }
    
    checkWinner() {
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningCombination = combination;
                return this.board[a];
            }
        }
        return null;
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Update current player indicator
        document.getElementById('currentPlayer').textContent = this.currentPlayer;
        
        // Update player active states
        document.querySelectorAll('.player').forEach(player => {
            player.classList.remove('active');
        });
        
        const activePlayer = this.currentPlayer === 'X' ? '.player-x' : '.player-o';
        document.querySelector(activePlayer).classList.add('active');
        
        // Update scores
        document.getElementById('scoreX').textContent = this.scores.X;
        document.getElementById('scoreO').textContent = this.scores.O;
        document.getElementById('draws').textContent = this.scores.draws;
        document.getElementById('gamesPlayed').textContent = this.gamesPlayed;
        
        // Update win rate
        const totalWins = this.scores.X + this.scores.O;
        const winRate = this.gamesPlayed > 0 ? Math.round((totalWins / this.gamesPlayed) * 100) : 0;
        document.getElementById('winRate').textContent = winRate + '%';
    }
    
    endGame(winner) {
        this.gameActive = false;
        this.gamesPlayed++;
        
        if (winner === 'draw') {
            this.scores.draws++;
            this.showGameOverModal('It\'s a Draw!', 'Good game! Try again?');
        } else {
            this.scores[winner]++;
            this.highlightWinningCells();
            this.showWinningLine();
            
            const winnerName = winner === 'X' ? 'Player X' : 
                              (this.gameMode === 'ai' && winner === 'O') ? 'AI' : 'Player O';
            this.showGameOverModal(`${winnerName} Wins!`, `Congratulations ${winnerName}!`);
            
            if (this.settings.animations) {
                document.querySelector('.game-board').classList.add('win-celebration');
                setTimeout(() => {
                    document.querySelector('.game-board').classList.remove('win-celebration');
                }, 1000);
            }
        }
        
        this.updateDisplay();
    }
    
    highlightWinningCells() {
        if (this.winningCombination) {
            this.winningCombination.forEach(index => {
                const cell = document.querySelector(`[data-index="${index}"]`);
                cell.classList.add('winning');
            });
        }
    }
    
    showWinningLine() {
        if (!this.winningCombination || !this.settings.animations) return;
        
        const line = document.getElementById('winningLine');
        const [a, b, c] = this.winningCombination;
        
        // Calculate line position and rotation
        const cells = document.querySelectorAll('.cell');
        const cellA = cells[a].getBoundingClientRect();
        const cellC = cells[c].getBoundingClientRect();
        const board = document.querySelector('.game-board').getBoundingClientRect();
        
        const centerAX = cellA.left + cellA.width / 2 - board.left;
        const centerAY = cellA.top + cellA.height / 2 - board.top;
        const centerCX = cellC.left + cellC.width / 2 - board.left;
        const centerCY = cellC.top + cellC.height / 2 - board.top;
        
        const length = Math.sqrt(Math.pow(centerCX - centerAX, 2) + Math.pow(centerCY - centerAY, 2));
        const angle = Math.atan2(centerCY - centerAY, centerCX - centerAX) * 180 / Math.PI;
        
        line.style.width = length + 'px';
        line.style.height = '4px';
        line.style.left = centerAX + 'px';
        line.style.top = centerAY + 'px';
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 50%';
        
        line.classList.add('show');
    }
    
    showGameOverModal(title, message) {
        document.getElementById('gameOverTitle').textContent = title;
        document.getElementById('gameOverMessage').textContent = message;
        this.showModal('gameOverModal');
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningCombination = null;
        
        // Clear board
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // Hide winning line
        const line = document.getElementById('winningLine');
        line.classList.remove('show');
        
        this.updateDisplay();
    }
    
    newGame() {
        this.resetGame();
        this.scores = { X: 0, O: 0, draws: 0 };
        this.gamesPlayed = 0;
        this.updateDisplay();
    }
    
    showSettings() {
        // Load current settings
        document.getElementById('difficultySelect').value = this.settings.difficulty;
        document.getElementById('animationToggle').checked = this.settings.animations;
        document.getElementById('soundToggle').checked = this.settings.sounds;
        
        this.showModal('settingsModal');
    }
    
    saveSettings() {
        this.settings.difficulty = document.getElementById('difficultySelect').value;
        this.settings.animations = document.getElementById('animationToggle').checked;
        this.settings.sounds = document.getElementById('soundToggle').checked;
        
        // Save to localStorage
        localStorage.setItem('ticTacToeSettings', JSON.stringify(this.settings));
        
        this.hideModal('settingsModal');
        this.showNotification('Settings saved!');
    }
    
    loadSettings() {
        const saved = localStorage.getItem('ticTacToeSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gradient-success);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-weight: 600;
            z-index: 2000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Sound effects (simple beep sounds using Web Audio API)
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playSound(frequency = 440, duration = 200, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    playMoveSound() {
        this.playSound(800, 150, 'sine');
    }
    
    playWinSound() {
        this.playSound(600, 200, 'sine');
        setTimeout(() => this.playSound(800, 200, 'sine'), 100);
        setTimeout(() => this.playSound(1000, 300, 'sine'), 200);
    }
    
    playDrawSound() {
        this.playSound(400, 500, 'sawtooth');
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToe();
    const soundManager = new SoundManager();
    
    // Add sound effects to game events
    const originalMakeMove = game.makeMove.bind(game);
    game.makeMove = function(index) {
        if (this.gameActive && this.board[index] === '' && this.settings.sounds) {
            soundManager.playMoveSound();
        }
        return originalMakeMove(index);
    };
    
    const originalEndGame = game.endGame.bind(game);
    game.endGame = function(winner) {
        if (this.settings.sounds) {
            if (winner === 'draw') {
                soundManager.playDrawSound();
            } else {
                soundManager.playWinSound();
            }
        }
        return originalEndGame(winner);
    };
    
    // Update sound manager when settings change
    const originalSaveSettings = game.saveSettings.bind(game);
    game.saveSettings = function() {
        soundManager.setEnabled(document.getElementById('soundToggle').checked);
        return originalSaveSettings();
    };
    
    // Add keyboard shortcuts info
    console.log('🎮 Tic Tac Toe Controls:');
    console.log('• Use number keys 1-9 to make moves');
    console.log('• Press Escape to close modals');
    console.log('• Click cells or use mouse to play');
    
    // Add some easter eggs
    let clickCount = 0;
    document.querySelector('.game-title').addEventListener('click', () => {
        clickCount++;
        if (clickCount === 5) {
            game.showNotification('🎉 You found the easter egg!');
            clickCount = 0;
        }
    });
});