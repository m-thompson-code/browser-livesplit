import { doc, getDoc, setDoc } from "firebase/firestore";
import { LivesplitState } from "../utilities/livesplit/livesplit";
import { db } from "./init";

export interface Player {
    uid: string;
    displayName: string;
    livesplitState?: LivesplitState;
    speedrun: string;
    room: string;
}

export const getPlayerSnapshot = async (uid: string): Promise<Player | null> => {
    const playerDoc = doc(db, "players", uid);

    return (await getDoc(playerDoc)).data() as Player | null;
}

export const setPlayer = async (player: Player): Promise<void> => {
    console.log("setPlayer", player);
    const playerDoc = doc(db, "players", player.uid);

    await setDoc(playerDoc, player).then(() => {
        console.log("setPlayer SUCCESS", player);
    }).catch(error => {
        console.error(error);
        throw error;
    });
}
