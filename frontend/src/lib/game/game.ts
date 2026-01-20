import { Pong } from "./pong";
import { AppUser} from "../api/appUser";

let canvas: HTMLCanvasElement;
let game: Pong;

const testUser1 = {} as AppUser;
const testUser2 = {} as AppUser;

canvas = document.getElementById("pong-game-canvas") as HTMLCanvasElement;
//game = new Pong(testUser1, testUser2, canvas);
