document.addEventListener("DOMContentLoaded",function(){
    const searchButton = document.getElementById("search-btn");
    const userNameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label"); 
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");    
    const cardStatsContainer = document.querySelector(".stats-card");



    function validateusername(username){
        if(username.trim() ==""){
            alert("Username should contain some value,it can't be empty");
            return false;
        }
        const regex= /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching){
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {

        try{

            searchButton.textContent="Searching...";
            searchButton.disabled = true;
            const targetUrl = 'https://leetcode.com/graphql';
            const myHeaders = new Headers();
            myHeaders.append("content-type","application/json");
            
        const proxyUrl = "https://cors-anywhere.herokuapp.com/"
        const graphql = JSON.stringify({
        query: "\nquery userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}",
        variables: {
            username: username // assuming `username` is defined as a JS variable
        }
        });
            const requestOptions={
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect:"follow"
            };  

            const response = await fetch(proxyUrl+targetUrl,requestOptions);
            if(!response.ok){
                throw new Error("Unable to fetch the user Details");
            }
            const parsedData = await response.json();
            console.log("Logging Data: ", parsedData);

            displayUserData(parsedData);

        }
        catch(error){
            //console.log(error);
            statsContainer.innerHTML = `<p>No Data Found </p>`
        }
        finally{
            searchButton.textContent = "Search";
            searchButton.disabled= false;
        }

    }

    function updateProgress(solved, total,label,circle){
        const progressDegree = (solved/total)*100;
        //console.log(progressDegree);
        circle.style.setProperty("--progress-degree",`${progressDegree}%`)
        label.textContent = `${solved}/${total}`;
    }


    function displayUserData(parsedData){
       const totalQuestions =  parsedData.data.allQuestionsCount[0].count;
       const totalEasyQuestions =  parsedData.data.allQuestionsCount[1].count;
       const totalMediumQuestions =  parsedData.data.allQuestionsCount[2].count;
       const totalHardQuestions =  parsedData.data.allQuestionsCount[3].count;

       const solvedQuestions = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
       const solvedEasyQuestions = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
       const solvedMediumQuestions = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
       const solvedHardQuestions = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;



       updateProgress(solvedEasyQuestions,totalEasyQuestions,easyLabel,easyProgressCircle);
       updateProgress(solvedMediumQuestions,totalMediumQuestions,mediumLabel,mediumProgressCircle);
       updateProgress(solvedHardQuestions,totalHardQuestions,hardLabel,hardProgressCircle);
       
       const cardsData=[
            {fieldName:"Overall Submissions",fieldValue:parsedData.data.matchedUser.submitStats.acSubmissionNum[0].submissions},
            {fieldName:"Easy Submissions",fieldValue:parsedData.data.matchedUser.submitStats.acSubmissionNum[1].submissions },
            {fieldName:"Medium Submissions",fieldValue:parsedData.data.matchedUser.submitStats.acSubmissionNum[2].submissions },
            {fieldName:"Hard Submissions",fieldValue:parsedData.data.matchedUser.submitStats.acSubmissionNum[3].submissions}
       ]
       cardStatsContainer.innerHTML = cardsData.map(
        data => {
            return `
                <div class="card">
                <h3>${data.fieldName}</h3>
                <p>${data.fieldValue}</p>
                </div>
            `
        }
       ).join("")
    }

    searchButton.addEventListener('click',function(){
        const username = userNameInput.value;
        console.log(username);
        if(validateusername(username)){
            fetchUserDetails(username);
        }
    })
})

