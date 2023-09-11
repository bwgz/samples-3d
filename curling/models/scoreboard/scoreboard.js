import * as THREE from "three";
import { dumpGeometry } from "../../utils.js";

const TOP = 0;
const BOTTOM = 1;

const colors = ["red", "yellow"];

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

    static generateTeams(width, height, teams, clocks) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.font = "24px Verdana";
        context.textRendering = "optimizeSpeed";

        for (let t = 0; t < 2; t++) {
            const color = colors[t];
            const origin = new THREE.Vector2(0, 0 + (height / 2) * t);

            let x, y, w, h;
            x = origin.x;
            y = origin.y + (height / 2) * 0.6 * t;
            w = width;
            h = (height / 2) * 0.4;
            const clock = { x, y, width: w, height: h };

            context.font = "16px Verdana";
            let textSize = ScoreboardModel.getTextSize(context, clocks[t]);
            context.fillStyle = color;
            context.fillText(clocks[t], clock.x + (w / 2) - (textSize.x / 2), clock.y + (h / 2) + (textSize.y / 2));
    
            x = origin.x;
            y = origin.y + (height / 2) * 0.4 * t;
            w = width;
            h = (height / 2) * 0.6;
            const team = { x: 0, y: t ? origin.y : clock.height, width: w, height: h };

            context.font = "24px Verdana";
            textSize = ScoreboardModel.getTextSize(context, teams[t]);
            context.fillStyle = "white";
            context.fillText(teams[t], team.x + (w / 2) - (textSize.x / 2), team.y + (h / 2) + (textSize.y / 2));
        }

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

    static generateEndLabelPositions(origin, width, height, ends) {
        const cellSize = new THREE.Vector2(width / ends, height / 2);
        const positions = [];
        for (let end = 0; end < ends + 1; end++) {
            const width = end < ends ? cellSize.x : cellSize.x * 2;
            const height = cellSize.y;
            const position = { x: origin.x + cellSize.x * end, y: origin.y, width, height };

            positions.push(position);
        }

        return positions;
    }

    static generateEndScorePositions(origin, width, height, ends) {
        const cellSize = new THREE.Vector2(width / ends, height / 2);
        const positions = [];
        positions.push([]);
        positions.push([]);
        for (let end = 0; end < ends + 1; end++) {
            const width = end < ends ? cellSize.x : cellSize.x * 2;
            const height = cellSize.y;
            const top = { x: origin.x + cellSize.x * end, y: origin.y, width, height };
            const bottom = {
                x: origin.x + cellSize.x * end,
                y: origin.y + cellSize.y,
                width,
                height,
            };

            positions[TOP].push(top);
            positions[BOTTOM].push(bottom);
        }

        return positions;
    }

    static generateScores(width, height, score) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.font = "24px Arial Narrow";
        context.textRendering = "optimizeSpeed";
        const ends = 10;

        let orgin = new THREE.Vector2(0, 0);
        const labelPositions = ScoreboardModel.generateEndLabelPositions(orgin, width * 0.8, height * 0.4, ends);
        for (let end = 0; end < ends + 1; end++) {
            const text = end < ends ? end + 1 : "Total";
            const textSize = ScoreboardModel.getTextSize(context, text);
            const position = labelPositions[end];
            context.fillStyle = "yellow";
            context.fillRect(position.x, position.y, position.width, position.height);
            context.strokeStyle = "black";
            context.lineWidth = 1;
            context.fillStyle = "black";
            context.strokeRect(position.x, position.y, position.width, position.height);
            context.fillText(
                text,
                position.x + (position.width - textSize.x) / 2,
                position.y + textSize.y + (position.height - textSize.y) / 2
            );
        }

        orgin = new THREE.Vector2(0, (height / 2) * 0.4);
        const scorePositions = ScoreboardModel.generateEndScorePositions(orgin, width * 0.8, height * 0.6, ends);

        for (let team = 0; team < 2; team++) {
            const color = colors[team];

            for (let end = 0; end < ends + 1; end++) {
                const text =
                    end < ends
                        ? score[team][end] !== undefined
                            ? score[team][end]
                            : ""
                        : score[team].reduce((a, b) => a + (b !== undefined ? b : 0), 0);
                const textSize = ScoreboardModel.getTextSize(context, text);
                const position = scorePositions[team][end];
                context.fillStyle = end < ends ? "black" : color;
                context.fillRect(position.x, position.y, position.width, position.height);
                context.strokeStyle = "white";
                context.lineWidth = 1;
                if (end < ends) {
                    context.fillStyle = "white";
                    context.strokeRect(position.x, position.y, position.width, position.height);
                }
                context.fillStyle = end < ends ? "white" : team === 0 ? "white" : "black";
                context.fillText(
                    text,
                    position.x + (position.width - textSize.x) / 2,
                    position.y + textSize.y + (position.height - textSize.y) / 2
                );
            }
        }

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
        const team = ["SWE", "USA"];
        const clock = ["28:10", "29:58"];
        const score = [];

        return new Promise((resolve) => {
            const width = dimensions.width;
            const height = dimensions.height;

            let position = new THREE.Vector3(0, 0, 0);

            let x = -width / 2;
            const y = height / 2;
            let percentage = 0.25;
            let sectionWidth = width * percentage;
            x += sectionWidth / 2;
            const teams = ScoreboardModel.generateTeams(sectionWidth, height, team, clock);
            position.set(x, y, 0);
            teams.position.set(position.x, position.y, position.z);
            x += sectionWidth / 2;

            const score = [
                [1, 0, 0, 0, 2, 0, 0, undefined, undefined, undefined],
                [0, 0, 1, 0, 0, 0, 3, undefined, undefined, undefined],
            ];
            percentage = 0.75;
            sectionWidth = width * percentage;
            x += sectionWidth / 2;
            const scores = ScoreboardModel.generateScores(width * percentage, height, score);
            position.set(x, y, 0);
            scores.position.set(position.x, position.y, position.z);

            const scoreboard = new THREE.Group();
            scoreboard.add(teams);
            //scoreboard.add(clocks);
            scoreboard.add(scores);
            dumpGeometry("scoreboard - group", scoreboard);

            scoreboard.rotateX(Math.PI / 2);
            resolve(scoreboard);
        });
    }
}

export { ScoreboardModel };
