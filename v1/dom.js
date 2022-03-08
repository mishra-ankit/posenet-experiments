

function updateScore(score, miss) {
    document.getElementById("score-text").innerText = `Score: ${score} \n Miss: ${miss}`;
}

function showOver() {
    document.getElementById("over").classList.remove("hidden");
}