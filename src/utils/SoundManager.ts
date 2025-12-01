// Define sound types
export type SoundType = 'DICE_ROLL' | 'MOVE' | 'CAPTURE' | 'WIN' | 'SAFE_SPOT' | 'HOME_ENTRY' | 'TURN_SWITCH' | 'FIGHT_HIT';

class SoundManager {
    private sounds: Record<SoundType, HTMLAudioElement>;
    private bgMusic: HTMLAudioElement;
    private enabled: boolean = true;

    constructor() {
        this.sounds = {
            DICE_ROLL: new Audio('http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/castle.mp3'),
            MOVE: new Audio('http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3'),
            CAPTURE: new Audio('http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3'),
            WIN: new Audio('http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3'),
            SAFE_SPOT: new Audio('http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/notify.mp3'),
            HOME_ENTRY: new Audio('http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/confirmation.mp3'),
            TURN_SWITCH: new Audio('http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/premove.mp3'),
            FIGHT_HIT: new Audio('https://assets.mixkit.co/active_storage/sfx/2153/2153-preview.mp3') // Punch/Hit sound
        };

        // Ambient background music (Nature sounds for now)
        this.bgMusic = new Audio('https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3'); 
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.2; // Default music volume

        // Preload sounds
        Object.values(this.sounds).forEach(sound => {
            sound.load();
            sound.volume = 0.5; // Default SFX volume
        });
    }

    play(type: SoundType) {
        if (!this.enabled) return;
        
        const sound = this.sounds[type];
        if (sound) {
            sound.currentTime = 0; // Reset to start
            sound.play().catch(e => console.warn('Audio play failed:', e));

            // Haptic Feedback
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                switch (type) {
                    case 'DICE_ROLL':
                        navigator.vibrate(50);
                        break;
                    case 'MOVE':
                        navigator.vibrate(20);
                        break;
                    case 'CAPTURE':
                        navigator.vibrate([50, 50, 50]);
                        break;
                    case 'WIN':
                        navigator.vibrate([100, 50, 100, 50, 200]);
                        break;
                    case 'SAFE_SPOT':
                        navigator.vibrate([30, 30]);
                        break;
                    case 'HOME_ENTRY':
                        navigator.vibrate(40);
                        break;
                    case 'TURN_SWITCH':
                        navigator.vibrate(30);
                        break;
                    case 'FIGHT_HIT':
                        navigator.vibrate([50, 50, 100]);
                        break;
                }
            }
        } else {
            console.warn(`Sound type ${type} not found`);
        }
    }

    toggleSound(enabled: boolean) {
        this.enabled = enabled;
        if (enabled) {
            this.bgMusic.play().catch(e => console.warn('BG Music play failed:', e));
        } else {
            this.bgMusic.pause();
        }
    }

    setVolume(master: number, music: number, sfx: number) {
        // Update Music Volume
        this.bgMusic.volume = music * master;

        // Update SFX Volume
        Object.values(this.sounds).forEach(sound => {
            sound.volume = sfx * master;
        });
    }

    // Initialize music on first interaction
    initMusic() {
        if (this.enabled) {
            this.bgMusic.play().catch(() => {
                // Autoplay might be blocked, wait for interaction
                const playHandler = () => {
                    this.bgMusic.play();
                    document.removeEventListener('click', playHandler);
                };
                document.addEventListener('click', playHandler);
            });
        }
    }
}

export const soundManager = new SoundManager();
