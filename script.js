const mazeEl = document.getElementById("maze");
const rows = 20, cols = 20;
let maze = [];
let start = [0, 0];
let end = [rows - 1, cols - 1];
let running = false;

function createMaze() {
  mazeEl.innerHTML = "";
  maze = [];
  for (let r = 0; r < rows; r++) {
    maze[r] = [];
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (Math.random() < 0.25 && !(r === 0 && c === 0) && !(r === rows - 1 && c === cols - 1)) {
        cell.classList.add("wall");
      }
      mazeEl.appendChild(cell);
      maze[r][c] = cell;
    }
  }
  maze[start[0]][start[1]].classList.add("start");
  maze[end[0]][end[1]].classList.add("end");
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function bfs() {
  if (running) return;
  running = true;
  let queue = [start];
  let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  let parent = {};
  visited[start[0]][start[1]] = true;

  while (queue.length > 0) {
    let [r, c] = queue.shift();
    if (r === end[0] && c === end[1]) break;
    for (let [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      let nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && !maze[nr][nc].classList.contains("wall")) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
        parent[`${nr},${nc}`] = [r, c];
        maze[nr][nc].classList.add("visited");
        await sleep(30);
      }
    }
  }
  drawPath(parent);
  running = false;
}

async function aStar() {
  if (running) return;
  running = true;

  function heuristic(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  }

  let openSet = [start];
  let gScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  let fScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  let parent = {};

  gScore[start[0]][start[1]] = 0;
  fScore[start[0]][start[1]] = heuristic(start, end);

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore[a[0]][a[1]] - fScore[b[0]][b[1]]);
    let [r, c] = openSet.shift();
    if (r === end[0] && c === end[1]) break;

    for (let [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      let nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !maze[nr][nc].classList.contains("wall")) {
        let tentative_g = gScore[r][c] + 1;
        if (tentative_g < gScore[nr][nc]) {
          parent[`${nr},${nc}`] = [r, c];
          gScore[nr][nc] = tentative_g;
          fScore[nr][nc] = tentative_g + heuristic([nr, nc], end);
          if (!openSet.some(([x, y]) => x === nr && y === nc)) {
            openSet.push([nr, nc]);
            maze[nr][nc].classList.add("visited");
            await sleep(30);
          }
        }
      }
    }
  }
  drawPath(parent);
  running = false;
}

function drawPath(parent) {
  let path = [];
  let curr = end;
  while (parent[`${curr[0]},${curr[1]}`]) {
    path.push(curr);
    curr = parent[`${curr[0]},${curr[1]}`];
  }
  path.reverse();
  for (let [r, c] of path) {
    if (!(r === start[0] && c === start[1]) && !(r === end[0] && c === end[1]))
      maze[r][c].classList.add("path");
  }
}

document.getElementById("generateBtn").addEventListener("click", createMaze);
document.getElementById("bfsBtn").addEventListener("click", bfs);
document.getElementById("astarBtn").addEventListener("click", aStar);
document.getElementById("resetBtn").addEventListener("click", createMaze);

createMaze();