import { getClockFormat } from "../../utilities/date/date";
import { LivesplitRow } from "../../utilities/livesplit-row/livesplit-row";
import styles from "./livesplit-row.component.css";

export class LivesplitRowComponent extends HTMLElement {
    static tagname = 'moo-livesplit-row';
    static define(): void {
        customElements.define(LivesplitRowComponent.tagname, LivesplitRowComponent);
    }
    static createElement(livesplitRow: LivesplitRow): LivesplitRowComponent {
        const element = document.createElement(LivesplitRowComponent.tagname) as LivesplitRowComponent;
        element.setLivesplitRow(livesplitRow);
        return element;
    }

    readonly labelElement = document.createElement("div");
    readonly deltaFromStartAtElement = document.createElement("span");
    readonly deltaFromSplitAtElement = document.createElement("span");

    livesplitRow!: LivesplitRow;

    constructor() {
        super();

        // Create a shadow root
        const shadow = this.attachShadow({ mode: "open" });

        // Create some CSS to apply to the shadow dom
        const style = document.createElement("style");
        style.textContent = styles;

        // Append styles
        shadow.appendChild(style);

        this.labelElement.classList.add("label");
        this.deltaFromStartAtElement.classList.add("delta");

        // Attach the created elements to the shadow dom
        shadow.appendChild(this.labelElement);
        shadow.appendChild(this.deltaFromStartAtElement);
    }

    setLivesplitRow(livesplitRow: LivesplitRow): void {
        this.livesplitRow = livesplitRow;
        
        this.setLabel(livesplitRow.state.label);
        this.setDeltaFromStartAt(livesplitRow.state.deltaFromStartAt);
        this.setDeltaFromSplitAt(livesplitRow.state.deltaFromSplitAt);

        this.livesplitRow.onLabelChanged((state) => this.setLabel(state.label));
        this.livesplitRow.onDeltaFromStartAtChanged((state) => this.setDeltaFromStartAt(state.deltaFromStartAt));
        this.livesplitRow.onDeltaFromSplitAtChanged((state) => this.setDeltaFromStartAt(state.deltaFromSplitAt));
    }

    setLabel(label: string): void {
        this.labelElement.textContent = label;
    }

    setDeltaFromStartAt(delta: number): void {
        this.deltaFromStartAtElement.textContent = delta ? `${getClockFormat(delta)}` : "-";
    }

    setDeltaFromSplitAt(delta: number): void {
        this.deltaFromSplitAtElement.textContent = delta ? `(+${getClockFormat(delta)})` : "";
    }
}
