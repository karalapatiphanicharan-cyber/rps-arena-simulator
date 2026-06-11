import type { CrazyEvent, CrazyEventName, CrazyModeState, CrazyModeStats } from '../types/game';

export class CrazyEventManager {
    private state: CrazyModeState;
    private lastEventTime: number = 0;
    private nextEventDelay: number = 0;

    constructor() {
        this.state = this.getInitialState();
        this.setNextEventDelay();
    }

    getInitialState(): CrazyModeState {
        return {
            enabled: false,
            activeEvent: null,
            history: [],
            stats: {
                eventsTriggered: 0,
                meteorEliminations: 0,
                freezeCount: 0,
                speedBoostActivations: 0,
                ruleReversals: 0
            }
        };
    }

    setEnabled(enabled: boolean) {
        this.state.enabled = enabled;
        if (!enabled) {
            this.state.activeEvent = null;
        }
    }

    reset(enabled: boolean = false) {
        this.state = this.getInitialState();
        this.state.enabled = enabled;
        this.lastEventTime = Date.now();
        this.setNextEventDelay();
    }

    private setNextEventDelay() {
        // Events every 10-20 seconds
        this.nextEventDelay = (Math.random() * 10 + 10) * 1000;
    }

    update(): CrazyEvent | null {
        if (!this.state.enabled) return null;

        const now = Date.now();

        // Handle active event expiration
        if (this.state.activeEvent) {
            if (now - this.state.activeEvent.startTime > this.state.activeEvent.duration) {
                this.state.activeEvent = null;
                this.lastEventTime = now;
                this.setNextEventDelay();
            }
            return this.state.activeEvent;
        }

        // Trigger new event
        if (now - this.lastEventTime > this.nextEventDelay) {
            this.triggerRandomEvent();
        }

        return this.state.activeEvent;
    }

    private triggerRandomEvent() {
        const events: { name: CrazyEventName; icon: string; color: string; duration: number }[] = [
            { name: 'Speed Boost', icon: '⚡', color: '#FACC15', duration: 10000 },
            { name: 'Freeze Wave', icon: '❄', color: '#3B82F6', duration: 8000 },
            { name: 'Double Population', icon: '🎲', color: '#10B981', duration: 3000 }, // Short duration as it's an instant action event
            { name: 'Meteor Strike', icon: '☄', color: '#EF4444', duration: 5000 },
            { name: 'Reverse Rules', icon: '🔄', color: '#A855F7', duration: 15000 },
            { name: 'Giant Entity', icon: '👑', color: '#F97316', duration: 15000 },
            { name: 'Chaos Storm', icon: '🌪', color: '#94A3B8', duration: 2000 }
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];

        const event: CrazyEvent = {
            id: `event-${Date.now()}`,
            name: randomEvent.name,
            icon: randomEvent.icon,
            color: randomEvent.color,
            startTime: Date.now(),
            duration: randomEvent.duration,
            data: this.getEventData(randomEvent.name)
        };

        this.state.activeEvent = event;
        this.state.history = [event.name, ...this.state.history].slice(0, 5);
        this.state.stats.eventsTriggered++;

        // Update specific stats
        if (event.name === 'Speed Boost') this.state.stats.speedBoostActivations++;
        if (event.name === 'Reverse Rules') this.state.stats.ruleReversals++;

        return event;
    }

    private getEventData(name: CrazyEventName): any {
        switch (name) {
            case 'Meteor Strike':
                return {
                    x: Math.random(), // percentage of width
                    y: Math.random(), // percentage of height
                    radius: 100,
                    warningDuration: 2000,
                    impacted: false
                };
            case 'Giant Entity':
                return {
                    targetId: null // To be filled by engine
                };
            case 'Double Population':
                const types = ['rock', 'paper', 'scissors'];
                return {
                    type: types[Math.floor(Math.random() * types.length)]
                };
            default:
                return null;
        }
    }

    getState(): CrazyModeState {
        return this.state;
    }

    addMeteorEliminations(count: number) {
        this.state.stats.meteorEliminations += count;
    }

    addFreezeCount(count: number) {
        this.state.stats.freezeCount += count;
    }
}
