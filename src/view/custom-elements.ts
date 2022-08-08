import { LivesplitRowComponent } from "./livesplit-row/livesplit-row.component";
import { LivesplitComponent } from "./livesplit/livesplit.component";

export const registerCustomElements = () => {
    LivesplitRowComponent.define();
    LivesplitComponent.define();
    console.log(" ~ registered custom elements");
};
