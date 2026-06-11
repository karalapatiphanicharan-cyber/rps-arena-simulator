import type { CrazyEvent, CrazyEventName, CrazyModeState } from '../types/game';

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
        // Events every 8-15 seconds
        this.nextEventDelay = (Math.random() * 7 + 8) * 1000;
    }

    update(): CrazyEvent | null {
        if (!this.state.enabled) return null;

        const now = Date.now();

        // Handle active event expiration
        if (this.state.activeEvent) {
            if (now - this.state.activeEvent.startTime > this.state.activeEvent.duration) {
                console.log(`Event Ended: ${this.state.activeEvent.name}`);
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
        const events: CrazyEventName[] = [
            'Speed Boost',
            'Freeze Wave',
            'Double Population',
            'Meteor Strike',
            'Reverse Rules',
            'Giant Entity',
            'Chaos Storm'
        ];
        const randomName = events[Math.floor(Math.random() * events.length)];
        return this.triggerEvent(randomName);
    }

    public triggerEvent(name: CrazyEventName): CrazyEvent {
        const eventConfigs: Record<CrazyEventName, { icon: string; color: string; duration: number }> = {
            'Speed Boost': { icon: '⚡', color: '#FACC15', duration: 10000 },
            'Freeze Wave': { icon: '❄', color: '#3B82F6', duration: 8000 },
            'Double Population': { icon: '🎲', color: '#10B981', duration: 3000 },
            'Meteor Strike': { icon: '☄', color: '#EF4444', duration: 5000 },
            'Reverse Rules': { icon: '🔄', color: '#A855F7', duration: 15000 },
            'Giant Entity': { icon: '👑', color: '#F97316', duration: 15000 },
            'Chaos Storm': { icon: '🌪', color: '#94A3B8', duration: 2000 }
        };

        const config = eventConfigs[name];

        const event: CrazyEvent = {
            id: `event-${Date.now()}`,
            name: name,
            icon: config.icon,
            color: config.color,
            startTime: Date.now(),
            duration: config.duration,
            data: this.getEventData(name)
        };

        this.state.activeEvent = event;
        this.state.history = [event.name, ...this.state.history].slice(0, 5);
        this.state.stats.eventsTriggered++;

        console.log(`Event Started: ${name}`);

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
        if (count > 0) {
            this.state.stats.meteorEliminations += count;
            console.log(`Entities Affected (Meteor): ${count}`);
        }
    }

    addFreezeCount(count: number) {
        if (count > 0) {
            this.state.stats.freezeCount += count;
            console.log(`Entities Affected (Freeze): ${count}`);
        }
    }
}
