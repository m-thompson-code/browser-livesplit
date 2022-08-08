import { signIn } from "./firebase/auth";
import { getPlayerSnapshot, Player, setPlayer } from "./firebase/firestore";
import { firebaseIsInitalized } from "./firebase/init";
import { Livesplit } from "./utilities/livesplit/livesplit";
import { registerCustomElements } from "./view/custom-elements";
import { LivesplitComponent } from "./view/livesplit/livesplit.component";

const addFont = (fontName: string) => {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(fontName)}:300,400,500&display=swap`;
    document.head.appendChild(link);
};

addFont("Roboto");
addFont("Roboto Mono");

registerCustomElements();

// check if firebase is initialzed
const init = firebaseIsInitalized();

if (!init) {
    throw new Error("Unexpected firebase is not initialized");
}

export const main = async () => {
    const userCredential = await signIn();// Will generate a new set of Certs if old ones aren't cached

    console.log("userCredential", userCredential);

    let player = await getPlayer(userCredential.user.uid);

    console.log("player", player);

    player = await verifySpeedrun(player); 
    const speedrun = player.speedrun;

    console.log("speedrun", speedrun);

    const room = await verifyRoom(player);

    console.log("room", room);

    const segments = Array.from({length: 16}, (_, i) => i + 1).map(num => `Exercise ${num}`);

    const livesplit = new Livesplit(segments);

    if (player.livesplitState) {
        livesplit.initFromState(player.livesplitState);
    }

    const customElement = LivesplitComponent.createElement(livesplit, () => {
        const room = window.prompt("What is your room?") ?? player.room;

        updateRoom(player, room);
    });

    document.body.append(customElement);

    livesplit.onAction((_, state) => {
        player = {...player, livesplitState: state };
        setPlayer(player);
    });
};

export const getPlayer = async(uid: string): Promise<Player> => {
    const player = await getPlayerSnapshot(uid);

    if (!player) {
        const displayName = window.prompt("What is your display name?") ?? `username ${Date.now()}`;

        await setPlayer({
            displayName,
            uid,
            room: "none",
            speedrun: "unknown",
        });

        return getPlayer(uid);
    }

    return player;
};

export const verifySpeedrun = async(player: Player): Promise<Player> => {
    if (!player.speedrun || player.speedrun === "unknown") {
        const speedrun = window.prompt("What speedrun are you doing?") ?? "unknown";

        const update: Player = {
            ...player,
            speedrun
        };

        await setPlayer(update);

        return update;
    }

    return player;
};

export const verifyRoom = async(player: Player): Promise<Player> => {
    if (!player.room || player.room === "none") {
        const room = window.prompt("What room are you in?") ?? "none";

        return updateRoom(player, room);
    }

    return player;
};

export const updateRoom = async(player: Player, room: string): Promise<Player> => {
    const update: Player = {
        ...player,
        room
    };

    await setPlayer(update);

    return update;
}

main();
