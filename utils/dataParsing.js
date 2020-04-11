const app =getApp();
const cloudCallBase =app.globalData.cloudCallBase;
function parsingRanklist(res){
  var ranklist = [];
  var data = res.data.data;
  data.forEach((v)=>{
    var songlist=[];
    v.songs.forEach(val=>{
      var [songname,singer] = val.split('@$');
      songlist.push({
        name:songname,
        singer:singer,
        coverImg:`${cloudCallBase}/songs/${songname}/cover.jpg`,
        source:`${cloudCallBase}/songs/${songname}/source.mp3`
      })
    })
    ranklist.push({
      rankname:v.list,
      songlist:songlist
    })
  })
  return ranklist;
}


module.exports ={
  parsingRanklist:parsingRanklist
}