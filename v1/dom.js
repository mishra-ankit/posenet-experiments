

function updateScore(score, miss) {
    document.getElementById("score-text").innerText = `Score: ${score} \n Miss: ${miss}`;
}

function showHideToggle(isVisible, id) {
    document.getElementById(id).classList.toggle("hidden", !isVisible);
}