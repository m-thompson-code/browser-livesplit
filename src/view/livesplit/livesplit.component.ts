import { Livesplit, LivesplitState } from "../../utilities/livesplit/livesplit";
import { getClockFormat } from "../../utilities/date/date";
import styles from "./livesplit.component.css";
import { LivesplitRowComponent } from "../livesplit-row/livesplit-row.component";
import { LivesplitRow } from "../../utilities/livesplit-row/livesplit-row";

export enum LiveSplitComponentSize {
    FULL = "FULL",
    SMALL = "SMALL",
    MINIMIZED = "MINIMIZED",
}

export class LivesplitComponent extends HTMLElement {
    static tagname = 'moo-livesplit';
    static define(): void {
        customElements.define(LivesplitComponent.tagname, LivesplitComponent);
    }
    static createElement(livesplit: Livesplit, onRoomClick: () => void): LivesplitComponent {
        const element = document.createElement(LivesplitComponent.tagname) as LivesplitComponent;
        element.setLivesplit(livesplit, onRoomClick);
        return element;
    }

    readonly headerELement = document.createElement("div");
    readonly rowElementsWrapper = document.createElement("div");
    readonly mainElement = document.createElement("div");
    readonly mainButtonElement = this.getButton('', () => this.onMainButtonClick());
    readonly deltaElement = document.createElement("div");
    readonly controlsElement = document.createElement("div");

    livesplit!: Livesplit;

    rows: LivesplitRowComponent[] = [];

    size = LiveSplitComponentSize.FULL;

    onRoomClick!: () => void;

    constructor() {
        super();

        // Create a shadow root
        const shadow = this.attachShadow({ mode: "open" });

        // Create some CSS to apply to the shadow dom
        const style = document.createElement("style");
        style.textContent = styles;

        // Append styles
        shadow.appendChild(style);

        this.headerELement.classList.add('header');
        this.headerELement.appendChild(this.getButton('Room', () => this.onRoomClick()));
        const maximizeButton = this.getButton('+', () => this.onMaximize());
        maximizeButton.classList.add('square-button');
        this.headerELement.appendChild(maximizeButton);
        const minimizeButton = this.getButton('-', () => this.onMinimize());
        minimizeButton.classList.add('square-button');
        this.headerELement.appendChild(minimizeButton);

        this.rowElementsWrapper.classList.add("rows");
        this.mainElement.appendChild(this.controlsElement);
        this.mainElement.classList.add("main");

        this.mainElement.appendChild(this.deltaElement);
        this.deltaElement.classList.add("main-delta");
        
        // Controls
        this.controlsElement.appendChild(this.mainButtonElement);

        // Attach the created elements to the shadow dom
        shadow.appendChild(this.headerELement);
        shadow.appendChild(this.rowElementsWrapper);
        shadow.appendChild(this.mainElement);
    }

    onMainButtonClick(): void {
        const state = this.livesplit.state;
        
        if (state.endAt) {
            this.livesplit.reset();
            return;
        }

        if (state.startAt) {
            this.livesplit.split();
            return;
        }

        this.livesplit.start();
    }

    setResetButton(): void {
        if (this.mainButtonElement.textContent === 'Reset') {
            return;
        }

        this.mainButtonElement.textContent = "Reset";
    }

    getButton(text: string, callback: () => void): HTMLButtonElement {
        const buttonElement = document.createElement("button");
        
        buttonElement.onclick = () => callback();

        buttonElement.textContent = text;

        return buttonElement;
    }

    setLivesplit(livesplit: Livesplit, onRoomClick: () => void): void {
        this.livesplit = livesplit;
        this.setMainDisplay(livesplit.state);
        this.setLabelsDisplay(livesplit.state);
        this.updateMainButtonText();

        this.livesplit.onCurrentAtChanged((state) => {
            this.setMainDisplay(state);
            this.setRows(state);
        });
        this.livesplit.onLabelsChanged((state) => this.setLabelsDisplay(state));
        this.livesplit.onAction(() => {
            this.updateMainButtonText();
            this.styleRows();
        });

        this.onRoomClick = onRoomClick;

        console.log("LIVE SPLIT COMPONENT", this, this.livesplit);
    }

    updateMainButtonText(): void {
        const state = this.livesplit.state;
        
        if (state.endAt) {
            this.mainButtonElement.textContent = "Reset";
            return;
        }

        if (state.startAt) {
            this.mainButtonElement.textContent = "Split";
            return;
        }

        this.mainButtonElement.textContent = "Start";
    }

    setLabelsDisplay(state: LivesplitState): void {
        this.rowElementsWrapper.innerHTML = "";
        this.rows = [];

        for (const segment of state.segments) {
            const label = segment.label;
            const deltaFromStartAt = segment.deltaFromStartAt;

            const rowElement = LivesplitRowComponent.createElement(new LivesplitRow(label, deltaFromStartAt));

            this.rows.push(rowElement);
            this.rowElementsWrapper.appendChild(rowElement);
        }
    }

    setMainDisplay(state: LivesplitState): void {
        const delta = state.currentAt - state.startAt;

        this.deltaElement.textContent = getClockFormat(delta);
    }

    setRows(state: LivesplitState): void {
        state.segments.forEach((segment, i) => {
            const rowElement = this.rows[i];
            
            rowElement.setLabel(segment.label);
            rowElement.setDeltaFromStartAt(segment.deltaFromStartAt);
            rowElement.setDeltaFromSplitAt(segment.deltaFromSplitAt);
        });
    }

    styleRows(): void {
        if (this.size === LiveSplitComponentSize.FULL) {
            this.rows.forEach(row => row.classList.remove('hide'));
            return;
        }

        if (this.size === LiveSplitComponentSize.MINIMIZED) {
            this.rows.forEach(row => row.classList.add('hide'));
            return;
        }

        const activeSegmentIndex = this.livesplit.state.segments.findIndex(segment => !segment.completed);
        const maxShowIndex = activeSegmentIndex === -1 ? this.rows.length - 1 : Math.max(1, activeSegmentIndex);
        this.rows.forEach((row, i) => {
            if (i === maxShowIndex || i === maxShowIndex - 1) {
                row.classList.remove('hide');
            } else {
                row.classList.add('hide');
            }
        });
    }

    setSize(size: LiveSplitComponentSize): void {
        this.size = size;
        console.log(size);

        this.styleRows();
    }

    onMinimize(): void {
        if (this.size === LiveSplitComponentSize.FULL) {
            this.setSize(LiveSplitComponentSize.SMALL);
            return;
        }

        this.setSize(LiveSplitComponentSize.MINIMIZED);
    }

    onMaximize(): void {
        if (this.size === LiveSplitComponentSize.MINIMIZED) {
            this.setSize(LiveSplitComponentSize.SMALL);
            return;
        }

        this.setSize(LiveSplitComponentSize.FULL);
    }
}
