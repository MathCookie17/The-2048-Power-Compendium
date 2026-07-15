let category = "Custom";
displayExamples();

for (let c of document.getElementsByClassName("customGuide_exampleReveal")) {
    c.addEventListener("click", function(){
        let d = c.parentElement;
        d = d.children[d.children.length - 1];
        if (getComputedStyle(d).getPropertyValue("display") == "none") {
            d.style.setProperty("display", "block");
            c.innerHTML = "Hide Save Code";
        }
        else {
            d.style.setProperty("display", "none");
            c.innerHTML = "Show Save Code";
        }
    })
};

document.getElementById("customMoreExamples_switchCustom").addEventListener("click", function(){
    category = "Custom";
    displayExamples();
})
document.getElementById("customMoreExamples_switchInfused").addEventListener("click", function(){
    category = "Infused";
    displayExamples();
})

function displayExamples() {
    document.getElementById("MoreCustomExamples").style.setProperty("display", "none");
    document.getElementById("customMoreExamples_switchCustom").style.setProperty("display", "flex");
    document.getElementById("MoreInfusedExamples").style.setProperty("display", "none");
    document.getElementById("customMoreExamples_switchInfused").style.setProperty("display", "flex");
    if (category == "Custom") {
        document.documentElement.style.setProperty("background-image", "radial-gradient( #520064, #d600e9)");
        document.getElementById("guide").style.setProperty("color", "#f7a1ff");
        document.getElementById("MoreCustomExamples").style.setProperty("display", "block");
        document.getElementById("customMoreExamples_switchCustom").style.setProperty("display", "none");
    }
    else if (category == "Infused") {
        document.documentElement.style.setProperty("background-image", "radial-gradient( #644d00, #e98400)");
        document.getElementById("guide").style.setProperty("color", "#f9ffa1");
        document.getElementById("MoreInfusedExamples").style.setProperty("display", "block");
        document.getElementById("customMoreExamples_switchInfused").style.setProperty("display", "none");
    }
}