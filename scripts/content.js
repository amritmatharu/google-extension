/* eslint-disable quotes */
window.addEventListener('load', (event) => {
    var gmail = new Gmail(); 
    gmail.observe.on("load", function(id, url, body, xhr) {
        //console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
        console.log("2: *************Calling Show Sentiments on Gmail list on load...")  ;
        var urlHash = window.location.hash ? window.location.hash.split("/"): [];
        if(urlHash && urlHash.length && urlHash.length>1){
            var secondHashPart = urlHash[1];
            if(secondHashPart.length ===32){
                showSentimntsInOpenEmail();
                insertAdjacentColumnToEmail();
                addToggleButton()
            }
        }
    }) 
    window.addEventListener('hashchange', function(e) {
        // wait for the message body to load
        showSentimntsInOpenEmail();
        insertAdjacentColumnToEmail();
        addToggleButton()
    });
    // Send a message to the background script requesting data from the API
    chrome.runtime.sendMessage({ action: "getEmailData" }, function(response) {
        // Manipulate the Gmail UI based on the API data
        if (response && response.status === "success") {
        // Add CSS styles to the Gmail UI based on the API data
        console.log("Response: ", response);
        }
    });
    fetch("https://jsonplaceholder.typicode.com/todos").then(function(response){
        console.log("response:::: ",response)
    })
});
function createSentimentsSection(emailObj){
    var sentimentDiv;
    var allSentimentDiv = document.createElement("div")
    if(emailObj.sentiment_label && emailObj.sentiment_label.length){
        emailObj.positive_words_list.forEach(positiveWord => {
            allSentimentDiv.append(addSentimentElement(positiveWord, "highlight-green"));
        });
        emailObj.negative_words_list.forEach(positiveWord => {
            allSentimentDiv.append(addSentimentElement(positiveWord, "highlight-red"));
        });
        sentimentDiv = ` 
        <div class="sentiments-detail">
        <h5 class="action-sets">Email sentiments</h5>
        <hr class="action_line"></hr>
        <div class="sentiments-div">${allSentimentDiv.innerHTML}</div>
        </div>
        `
    }
    return sentimentDiv;
}
function createActionSection(emailObj){
    var actionsDiv;
    var allActionsDiv = document.createElement("div")
    if(emailObj.actions_list && emailObj.actions_list.length){
        emailObj.actions_list.forEach(actionWord => {
            allActionsDiv.append(addSentimentElement(actionWord, "highlight-actions-blue"));
        });
        actionsDiv = ` 
        <div class="sentiments-detail">
        <h5 class="action-sets">Email Actions</h5>
        <hr class="action_line"></hr>
        <div class="sentiments-div">${allActionsDiv.innerHTML}</div>
        </div>
        `
    }
    return actionsDiv;
}
function createSentimentScore(emailObj){
    var sentimentScore = (emailObj.sentiment_score * 10).toFixed(1);
    var sentimentBarWidth = (emailObj.sentiment_score * 100).toFixed(2);
    var sentimentScoreDiv =`<p class="overall-sentiment">Overall Sentiments</p>
    <p class="sentiment-score">              
        <span id="score" class="score">${sentimentScore}</span>
        &nbsp; &nbsp;&nbsp;<span class="out">out of 10</span>
    </p>
    <p class="linear">
        <div id="myProgress" >
            <div id="myBar" style="width:${sentimentBarWidth}%"></div>
        </div>
    </p>
    <span id="percent">${sentimentBarWidth} % ${emailObj.sentiment_label}</span>
    `;
    return sentimentScoreDiv;
}
function getEmailJson(){
    var emailObj =  {
        "sentiment_label": "Negative",
        "sentiment_score": 0.9339512586593628,
        "positive_words_list": [
          "Support",
          "Commitment",
          "High",
          "Success"
        ],
        "negative_words_list": [
          "Lack of quality",
          "Unacceptable",
          "Personal Issues",
          "Concerns"
        ],
        "actions_list": [
          "Take immediate action",
          "Ensure quality and timeline",
          "Schedule meeting"
        ]
    };
    return emailObj;
}
function createRightPanel(){
    var emailObj = getEmailJson();
    var sentimentScoreDiv = createSentimentScore(emailObj);
    var sentimentDiv = createSentimentsSection(emailObj);
    var actionsDiv = createActionSection(emailObj)
    const newDiv = `<div id="sentiment-container" class="sentiment-container hidden"> ${sentimentScoreDiv}${sentimentDiv}${actionsDiv}</div>`;
    return newDiv;

}
function addSentimentElement(textContent, classname){
    const newColumn = document.createElement('div');
    newColumn.classList.add(classname) 
    var icon = document.createElement("i");
    if(classname.includes("green") || classname.includes("actions")){
        icon.classList.add("fa-regular")
        icon.classList.add("fa-thumbs-up")
    }else if(classname.includes("red")){
        icon.classList.add("fa-solid")
        icon.classList.add("fa-circle-exclamation")
    }
    newColumn.append(icon);
    var spanSentiments = document.createElement("span")    
    spanSentiments.classList.add("sentiment-span");
    spanSentiments.textContent = textContent;
    newColumn.append(spanSentiments);
    return newColumn;
  }
function showSentimntsInOpenEmail(){
    const searchTerm = 'Leave';
    const intervalId = setInterval(function() {
      var matches = document.querySelectorAll(".a3s");;
      if (matches && matches.length) {
        clearInterval(intervalId);
        for (var i = 0; i < matches.length; i++) {
          var element = matches[i];
          const emailBody = element.innerHTML;
          if (emailBody.includes(searchTerm) && !emailBody.includes("sentiments")) {   
            const regex = new RegExp(`(?<!<a[^>]*?)\\b${searchTerm}\\b(?![^<]*?<\\/a>|[^<>]*?href=['"][^'"]*?\\b${searchTerm}\\b)`, 'gi');
            // Replace all occurrences of the search term with a highlighted version
            const highlightedEmailBody = emailBody.replace(regex, '<span class="sentiments">$&</span>');
            document.querySelector('.a3s').innerHTML = highlightedEmailBody;
          }
        }      
      }
    }, 100); 
  }
  // Helper function to check if a node is inside an anchor tag
function isInsideAnchorTag(node) {
    let ancestor = node.parentNode;
    while (ancestor !== null) {
      if (ancestor.tagName === 'A') {
        return true;
      }
      ancestor = ancestor.parentNode;
    }
    return false;
  }
function insertAdjacentColumnToEmail(){
    // content script for your extension
    const emailBody = document.querySelector('.a3s'); // select the email body element
    emailBody.parentElement.style.display="flex";
    //emailBody.style.border = '1px solid grey';
    emailBody.style.padding = '25px';
    emailBody.style.width="75%"
    const newColumn = document.createElement('div'); // create a new column element
    newColumn.classList.add("adjacent-div")    
    newColumn.style.height = "auto"; // set the height of the new column to match the email body
    var rightPanel = document.createElement("div");
    rightPanel.classList.add("right-panel");
    newColumn.append(rightPanel);   
    emailBody.parentNode.insertBefore(newColumn, emailBody.nextSibling); //
    const rightPanelElement = document.querySelector(".right-panel");    
    rightPanelElement.innerHTML=createRightPanel()
}
function enableExtensionChanges(){
    showSentimntsInOpenEmail();
    insertAdjacentColumnToEmail();
}
function disableExtensionChanges(){
    removeHighlights();
    removeEmailBodyStyles()
}
function removeAdjacentColumn(){
    var adjDiv = document.querySelector(".adjacent-div");
    if(adjDiv){
        adjDiv.parentNode.removeChild(adjDiv);
    }    
}
function removeEmailBodyStyles(){
    var messageBody = document.querySelector(".a3s")
    if(messageBody){
        messageBody.style="";
        messageBody.parentElement.style.display="block"
        removeAdjacentColumn()
    }
  
}
function removeHighlights(){
    var spans = document.querySelectorAll('.sentiments');
    if(spans && spans.length){
        for (var i = 0; i < spans.length; i++) {
            var content = spans[i].innerHTML;
            $(spans[i]).replaceWith(content);
        }
    }
   
}
function addToggleButton(){
    // content script for your extension
    const emailBody = document.querySelector('.a3s'); // select the email body element
    const newButton = document.createElement('button'); // create a new button element
    newButton.textContent = 'Disable Extension'; // set the text content of the button
    newButton.onclick = function() { // add a click event listener to the button
        //chrome.runtime.sendMessage({command: 'toggleExtension'}); // send a message to the background script to toggle the extension
        if (newButton.textContent === 'Disable Extension') {
            disableExtensionChanges();
            newButton.textContent = 'Enable Extension'; // toggle the text content of the button
        } else {
            newButton.textContent = 'Disable Extension';
            enableExtensionChanges()
        }
    };
    emailBody.parentElement.insertAdjacentElement( "afterend" ,newButton); // append the button element to the email body element

}



