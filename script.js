"use strict";

//store response
let globalResponse = [];
let currentLeftIndex;
let videoCount;

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
        insertVideo(currentLeftIndex + videoCount);
        videoCount = 2;
        console.log("qwer");
    }

    if (window.innerWidth > 860 && videoCount == 2) {
        insertVideo(currentLeftIndex + videoCount);
        videoCount = 3;
    }

    if (window.innerWidth > 1170 && videoCount == 3) {
        insertVideo(currentLeftIndex + videoCount);
        videoCount = 4;
    }
}

//initialize API
function initAPIClient() {
    gapi.client.load("youtube", "v3");
    gapi.client.setApiKey("AIzaSyCXnUvOqwl4Y3kcQTLlVdueJh9_kxkT7ws");
    console.log("connected");
}

//insert new video
function insertVideo(i){
    let videoList = document.getElementById('videoList');
    let simpleVideo = document.getElementById('tpl').content;
    videoList.appendChild(simpleVideo.cloneNode(true))

    let videos = document.getElementsByClassName('simple');
    let fields = videos[i].getElementsByTagName('div');
    fields[0].innerHTML = globalResponse[i].snippet.title;
    fields[1].innerHTML = globalResponse[i].snippet.description;
    videos[i].getElementsByTagName('img')[0].src = "http://i.ytimg.com/vi/" + globalResponse[i].id.videoId + "/mqdefault.jpg";
    videos[i].getElementsByTagName('a')[0].href = "https://www.youtube.com/watch?v=" + globalResponse[i].id.videoId;
}

//onclick event
function search() {
    let query = document.getElementById('query').value;
    let request = gapi.client.youtube.search.list({
        part: 'snippet',
        type: "video",
        q: query,
        maxResult: 20
    });
    request.execute(getResponse);
}

//output response
function getResponse(response) {
    console.log(response.result.items);
    globalResponse.concat(response.result.items);
    console.log(globalResponse);
    currentLeftIndex = 0;
    videoCount = 4;

    let videoList = document.getElementById('videoList');
    let simpleVideo = document.getElementById('tpl').content;

    for(let i = 0; i < 4; i++)
        videoList.appendChild(simpleVideo.cloneNode(true))

    for(let i = 0; i < 4; i++)
    {
        let videos = document.getElementsByClassName('simple');
        let fields = videos[i].getElementsByTagName('div');
        fields[0].innerHTML = response.result.items[i].snippet.title;
        fields[1].innerHTML = response.result.items[i].snippet.description;
        videos[i].getElementsByTagName('img')[0].src = "http://i.ytimg.com/vi/" + response.result.items[i].id.videoId + "/mqdefault.jpg";
        videos[i].getElementsByTagName('a')[0].href = "https://www.youtube.com/watch?v=" + response.result.items[i].id.videoId;
    }
}