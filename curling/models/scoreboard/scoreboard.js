import * as THREE from "three";
import { dumpGeometry } from "../../utils.js";

const TOP = 0;
const BOTTOM = 1;

function generateQuadrant(width, height, color) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    context.fillStyle = color;
    context.fillRect(0, 0, width, height);

    return canvas;
}

class ScoreboardModel {
    static getTextSize(context, text) {
        let metrics = context.measureText(text);
        let width = metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft;
        let hight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

        return new THREE.Vector2(width, hight);
    }

    static generateTeams(width, height, teams) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.font = "30px Verdana";
        context.textRendering = "optimizeSpeed";
        const topTextSize = ScoreboardModel.getTextSize(context, teams[TOP]);
        const bottomTextSize = ScoreboardModel.getTextSize(context, teams[BOTTOM]);
        const textSize = new THREE.Vector2(Math.max(topTextSize.x, bottomTextSize.x), Math.max(topTextSize.y, bottomTextSize.y));

        const top = { x: 0, y: 0, width, height: height / 2 };
        const bottom = { x: 0, y: height / 2, width, height: height / 2 };

        context.fillStyle = "black";
        context.fillRect(top.x, top.y, top.width, top.height);
        context.fillStyle = "white";
        context.fillText(teams[TOP], top.x + (top.width / 2) - (textSize.x / 2), top.y + top.height / 2);

        context.fillStyle = "black";
        context.fillRect(bottom.x, bottom.y, top.width, top.height);
        context.fillStyle = "white";
        context.font = "30px Verdana";
        context.fillText(teams[BOTTOM], bottom.x + (bottom.width / 2) - (textSize.x / 2), bottom.y + bottom.height / 2);

        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            opacity: 1,
            emissive: 0xffffff,
            emissiveIntensity: 0.05,
        });

        const geometry = new THREE.BoxGeometry(width, height);
        const mesh = new THREE.Mesh(geometry, material);

        return mesh;
    }

    static generateClocks(width, height, clocks) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.font = "24px Verdana";
        context.textRendering = "optimizeSpeed";
        const topTextSize = ScoreboardModel.getTextSize(context, clocks[TOP]);
        const bottomTextSize = ScoreboardModel.getTextSize(context, clocks[BOTTOM]);
        const textSize = new THREE.Vector2(Math.max(topTextSize.x, bottomTextSize.x), Math.max(topTextSize.y, bottomTextSize.y));

        console.log("textSize", textSize);

        const top = { x: 0, y: 0, width, height: height / 2 };
        const bottom = { x: 0, y: height / 2, width, height: height / 2 };

        context.fillStyle = "red";
        context.fillRect(top.x, top.y, top.width, top.height);
        context.fillStyle = "white";
        context.fillText(clocks[TOP], top.x + (top.width / 2) - (textSize.x / 2), top.y + top.height / 2);

        context.fillStyle = "yellow";
        context.fillRect(bottom.x, bottom.y, top.width, top.height);
        context.fillStyle = "black";
        context.fillText(clocks[BOTTOM], bottom.x + (bottom.width / 2) - (textSize.x / 2), bottom.y + bottom.height / 2);

        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            opacity: 1,
            emissive: 0xffffff,
            emissiveIntensity: 0.05,
        });

        const geometry = new THREE.BoxGeometry(width, height);
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }

    static generateScores(width, height, scores) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.font = "24px Verdana";
        context.textRendering = "optimizeSpeed";
        const topTextSize = ScoreboardModel.getTextSize(context, scores[TOP]);
        const bottomTextSize = ScoreboardModel.getTextSize(context, scores[BOTTOM]);
        const textSize = new THREE.Vector2(Math.max(topTextSize.x, bottomTextSize.x), Math.max(topTextSize.y, bottomTextSize.y));

        console.log("textSize", textSize);

        const ends = { x: 0, y: 0, width, height: height * 0.2 };
        const top = { x: 0, y: height / 2, width, height: height / 2 };
        const bottom = { x: 0, y: height / 2, width, height: height / 2 };

        context.fillStyle = "black";
        context.fillRect(ends.x, ends.y, ends.width, ends.height);
        context.fillStyle = "white";
        context.fillText(scores[TOP], ends.x + (ends.width / 2) - (textSize.x / 2), ends.y + ends.height / 2);

        context.fillStyle = "black";
        context.fillRect(bottom.x, bottom.y, ends.width, ends.height);
        context.fillStyle = "white";
        context.fillText(scores[BOTTOM], bottom.x + (bottom.width / 2) - (textSize.x / 2), bottom.y + bottom.height / 2);

        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            opacity: 1,
            emissive: 0xffffff,
            emissiveIntensity: 0.05,
        });

        const geometry = new THREE.BoxGeometry(width, height);
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }

    static generate(dimensions) {
        const clock = [];
        const score = [];

        return new Promise((resolve) => {
            const width = dimensions.width;
            const height = dimensions.height;

            let position = new THREE.Vector3(0, 0, 0);

            let x = -width / 2;
            const y = height / 2;
            let percentage = 0.2;
            let sectionWidth = width * percentage;
            x += sectionWidth / 2;
            const teams = ScoreboardModel.generateTeams(sectionWidth, height, ["SWE", "USA"]);
            position.set(x, y, 0);
            teams.position.set(position.x, position.y, position.z);
            x += sectionWidth / 2;

            percentage = 0.2;
            sectionWidth = width * percentage;
            x += sectionWidth / 2;
            const clocks = ScoreboardModel.generateClocks(width * percentage, height, ["27:35", "29:12"]);
            position.set(x, y, 0);
            clocks.position.set(position.x, position.y, position.z);
            x += sectionWidth / 2;

            percentage = 0.6;
            sectionWidth = width * percentage;
            x += sectionWidth / 2;
            const scores = ScoreboardModel.generateScores(width * percentage, height, ["27:35", "29:12"]);
            position.set(x, y, 0);
            scores.position.set(position.x, position.y, position.z);

            const scoreboard = new THREE.Group();
            scoreboard.add(teams);
            scoreboard.add(clocks);
            scoreboard.add(scores);
            dumpGeometry("scoreboard - group", scoreboard);

            scoreboard.rotateX(Math.PI / 2);
            resolve(scoreboard);
        });
    }
}

export { ScoreboardModel };
