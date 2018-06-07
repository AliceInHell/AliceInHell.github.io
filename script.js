"use strict";

//P.S   в файле README немного напишу, что и как делал



////SOME VARIABLES////


//store response
let globalResponse = [];
//index of the left video
let currentLeftIndex;
//count of displaying viedos
let videoCount;
//API key
let APIKey = "AIzaSyCXnUvOqwl4Y3kcQTLlVdueJh9_kxkT7ws";
//next page
let nextPageToken;
//query
let query;




////WORKING WITH YOUTUBE AND VIDEO////

                                                                    /*working with network*/
//initialize API
function initAPIClient() {
    gapi.client.load("youtube", "v3");
    gapi.client.setApiKey(APIKey);
    console.log("connected");
}




//onclick event to start searching
function search() {

    //clear field
    let videoList = document.getElementById('videoList');
    let fc = videoList.firstChild;
    while(fc){
        videoList.removeChild(fc);
        fc = videoList.firstChild;
    }

    query = document.getElementById('query').value;
    let request = gapi.client.youtube.search.list({
        part: 'snippet',
        type: "video",
        q: query,
        maxResult: 5,
        videoDuration: 'any'
    });
    request.execute(getResponse);
}





//output response
function getResponse(response) {
    globalResponse.length = 0;
    response.result.items.forEach(function(item){
        globalResponse.push(item);
    });
    currentLeftIndex = 0;
    nextPageToken = response.result.nextPageToken;

    videoCount = getCurrentVideoCount();

    for(let i = 0; i < videoCount; i++){
        insertVideo(i);
    }

    //set handlers
    document.onmousemove = mouseMove;
    document.getElementsByClassName('container')[0].onmousedown = mouseDown;
    document.onmouseup = mouseUp;
}




//load next/prev videos
function getPage(token){
    let request = gapi.client.youtube.search.list({
        pageToken: token,
        part: 'snippet',
        type: "video",
        q: query,
        maxResult: 5,
        videoDuration: 'any'
    });
    request.execute(getNewVideoResponse);
}





//load videos because of new request
function getNewVideoResponse(response){
    response.result.items.forEach(function(item){
        globalResponse.push(item);
    });
    nextPageToken = response.result.nextPageToken;
}




                                                                                    /*working with video, output and adaptivity*/
//add or remove video in the context of the screen width
window.onresize = function () {
    if (window.innerWidth <= 1170 && videoCount == 4) {
        document.getElementsByClassName('simple')[3].remove();
        videoCount = 3;
    }

    if (window.innerWidth <= 860 && videoCount == 3) {
        document.getElementsByClassName('simple')[2].remove();
        videoCount = 2;
    }

    if (window.innerWidth <= 595 && videoCount == 2) {
        document.getElementsByClassName('simple')[1].remove();
        videoCount = 1;
    }
    if (window.innerWidth > 595 && videoCount == 1) {
        if(getCurrentVideoCount() + currentLeftIndex + 1 == globalResponse.length)
            getPage(nextPageToken);
        insertVideo(1);
        videoCount = 2;
        console.log(videoCount);
    }

    if (window.innerWidth > 860 && videoCount == 2) {
        if(getCurrentVideoCount() + currentLeftIndex + 1 == globalResponse.length)
            getPage(nextPageToken);
        insertVideo(2);
        videoCount = 3;
    }

    if (window.innerWidth > 1170 && videoCount == 3) {
        if(getCurrentVideoCount() + currentLeftIndex + 1 == globalResponse.length)
            getPage(nextPageToken);
        insertVideo(3);
        videoCount = 4;
    }

    deleteTrash(document.getElementsByClassName('container'), getCurrentVideoCount());
};




//insert new video to the and
function insertVideo(i){
    let videoList = document.getElementById('videoList');
    let simpleVideo = document.getElementById('tpl').content.children[0];
    videoList.appendChild(simpleVideo.cloneNode(true));

    let videos = document.getElementsByClassName('simple');
    let fields = videos[i].getElementsByTagName('div');
    fields[0].innerHTML = globalResponse[currentLeftIndex + i].snippet.title;
    if(globalResponse[currentLeftIndex + i].snippet.description === "")
        fields[1].innerHTML = "(No description)";
    else
        fields[1].innerHTML = globalResponse[currentLeftIndex + i].snippet.description;
    fields[3].innerHTML = globalResponse[currentLeftIndex + i].snippet.channelTitle;
    videos[i].getElementsByTagName('img')[0].src = "http://i.ytimg.com/vi/" + globalResponse[currentLeftIndex + i].id.videoId + "/mqdefault.jpg";
    videos[i].getElementsByTagName('a')[0].href = "https://www.youtube.com/watch?v=" + globalResponse[currentLeftIndex + i].id.videoId;

    //get duration
    let getRequest = new XMLHttpRequest();
    getRequest.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=" + globalResponse[currentLeftIndex + i].id.videoId + "&key=" + APIKey, true);
    getRequest.onreadystatechange = function(){

        fields[2].innerHTML = getDuration(JSON.parse(getRequest.responseText).items[0].contentDetails.duration);
    };
    getRequest.send(null);
}




//insert new video to the begining
function insertVideoToStart(i){
    let videoList = document.getElementById('videoList');
    let simpleVideo = document.getElementById('tpl').content.children[0];
    videoList.insertBefore(simpleVideo.cloneNode(true), videoList.firstChild);

    let videos = document.getElementsByClassName('simple');
    let fields = videos[0].getElementsByTagName('div');
    fields[0].innerHTML = globalResponse[i].snippet.title;
    if(globalResponse[i].snippet.description === "")
        fields[1].innerHTML = "No description";
    else
        fields[1].innerHTML = globalResponse[i].snippet.description;
    fields[3].innerHTML = globalResponse[i].snippet.channelTitle;
    videos[0].getElementsByTagName('img')[0].src = "http://i.ytimg.com/vi/" + globalResponse[i].id.videoId + "/mqdefault.jpg";
    videos[0].getElementsByTagName('a')[0].href = "https://www.youtube.com/watch?v=" + globalResponse[i].id.videoId;

    //get duration
    let getRequest = new XMLHttpRequest();
    getRequest.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=" + globalResponse[i].id.videoId + "&key=" + APIKey, true);
    getRequest.onreadystatechange = function(){

        fields[2].innerHTML = getDuration(JSON.parse(getRequest.responseText).items[0].contentDetails.duration);
    };
    getRequest.send(null);
}




//convert ISO 8601 format(PT*D*M*S) into normal
function getDuration(string){

    //difficult regex from some forum
    let regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/
    let matches = string.match(regex);

    //hours
    if (matches[12] === undefined)
        matches[12] = 0;

    //minutes
    if (matches[14] === undefined)
        matches[14] = 0;

    //seconds
    if (matches[16] === undefined)
        matches[16] = 0;

    return matches[12] + ":" + matches[14] + ":" + matches[16];
}




//deside, how many videos current windowSize can contain
function getCurrentVideoCount(){
    if(window.innerWidth <= 595)
        return 1;
    else
    if(window.innerWidth >= 595)
        if(window.innerWidth >= 866)
            if(window.innerWidth >= 1170)
                return 4;
            else
                return 3;
        else
            return 2;
}




////LETS WORK WITH MOUSE////

                                                                            /*movement*/
//flag
let movable = false;
//save click position
let clickX;




function mouseDown(e){
    clickX = e.clientX;
    movable = true;
}




function mouseMove(e){
    if(movable) {
        let container = document.getElementsByClassName('container')[0];
        let moveX = e.clientX - clickX;
        if (moveX < 0) {
            container.style.left = Math.floor((container.offsetLeft - (Math.abs(moveX))) / 2) + 'px';
        }
        else if (currentLeftIndex === 0)
            return;
        else {
            container.style.left = Math.floor((container.offsetLeft + moveX) / 2) + 'px';
        }


        //checking for necessity of loading new videos and show new one if need
        if(Math.abs(clickX - e.clientX) > 185){
            movable = false;

            //define direction
            if(clickX - e.clientX > 0) {
                //----->
                clickX = e.clientX;

                //we must add video to the right side
                if (currentLeftIndex + getCurrentVideoCount() + 1 === globalResponse.length) {
                    //have to load new 5 videos
                    getPage(nextPageToken);
                }

                //delete first video and show last
                insertVideo(getCurrentVideoCount());
                let fc = container.firstChild;
                container.removeChild(fc);
                currentLeftIndex += 1;
                container.style.left = '1px';
            }
            else
            {
                //<------
                clickX = e.clientX;

                let fc = container.lastChild;
                container.removeChild(fc);
                insertVideoToStart(currentLeftIndex - 1);
                currentLeftIndex -= 1;
                container.style.left = '1px';
            }

            movable = true;
            deleteTrash(container, getCurrentVideoCount());
        }
    }
}




function mouseUp(e){
    movable = false;
    let container = document.getElementsByClassName('container')[0];
    container.style.left = '1px';
    deleteTrash(container, getCurrentVideoCount());
}



                                                                            /*if smth happens*/
//emergency)))
function deleteTrash(container, i){
    console.log(container.childNodes.length);
    while(container.childNodes.length > i){
        let fc = container.lastChild;
        container.removeChild(fc);
    }
}