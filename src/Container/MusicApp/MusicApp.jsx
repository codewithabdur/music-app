import React, { useEffect, useState } from "react";
import { FaHistory } from "react-icons/fa";
import { IoMdMusicalNote } from "react-icons/io";
import { RiAlbumFill } from "react-icons/ri";
import { MdPlaylistPlay } from "react-icons/md";
import "./MusicApp.css";
import oldclient from "../../lib/oldclient";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
} from "@material-ui/icons";
import parseFloat from "parsefloat";
import { DNA } from "react-loader-spinner";
import { FaHeart } from "react-icons/fa";
import { CgPlayListAdd } from "react-icons/cg";
import { CgPlayListCheck } from "react-icons/cg";
import { doc, setDoc, addDoc } from "firebase/firestore";
import { auth, db, storage } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const MusicApp = () => {
  const [songs, setSongs] = useState([]);
  const [volume, setVolume] = useState(1);
  const [music, setMusic] = useState(1);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [download, setDownload] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState(
    Array(songs.length).fill(false)
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [history, setHistory] = useState({
    file: "",
    image: "",
    fileName: "",
  })

   const toggleDownloadStatus = (index) => {
     const updatedStatus = [...downloadStatus];
     updatedStatus[index] = !updatedStatus[index];
     setDownloadStatus(updatedStatus);
   };

  const playPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  useEffect(() => {
    if (audioPlayer) {
      if (isPlaying) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    }
  }, [audioPlayer, isPlaying]);



  const handleVolumeChange = (event) => {
    setVolume(event.target.value);
    audioPlayer.volume = event.target.value;
  };

  const handleMusicChange = (event) => {
    const value = parseFloat(event.target.value); // Parse float instead of int
    if (
      !isNaN(value) &&
      isFinite(value) &&
      value >= 0 &&
      value <= 1 &&
      audioPlayer.duration &&
      isFinite(audioPlayer.duration)
    ) {
      setMusic(value);
      audioPlayer.currentTime = value * audioPlayer.duration;
    }
  };

const playSong = (index, image, fileName, file) => {
  // Pause the previous audio player if it exists
  setHistory({
    file: file,
    image: image,
    fileName: fileName,
  });


  if (audioPlayer) {
    audioPlayer.pause();
  }

  // Set up the new audio player
  const newAudioPlayer = new Audio(songs[index]?.file?.asset?.url);
  setAudioPlayer(newAudioPlayer);
  setCurrentSongIndex(index);
  setMusic(0);
  setIsPlaying(true);
  playPause();
};

useEffect(() => {
  const checkHistory = async () => {
    if (
      history.file !== "" &&
      history.image !== "" &&
      history.fileName !== ""
    ) {
      const historyRef = collection(db, "history");
      const historyQuery = query(historyRef, where("file", "==", history.file));

      try {
        const querySnapshot = await getDocs(historyQuery);
        if (querySnapshot.size === 0) {
          // Add the history to Firestore if it doesn't exist
          await addDoc(historyRef, history);
          console.log("History stored successfully!");
        } else {
          console.log("History already exists in Firestore.");
        }
      } catch (error) {
        console.error("Error checking history:", error);
      }
    }
  };

  checkHistory();
}, [history]);



  const handleNext = () => {
    setAudioPlayer(new Audio(songs[currentSongIndex + 1]?.file?.asset?.url));
    setCurrentSongIndex(currentSongIndex + 1);
    setMusic(0);
    setIsPlaying(true);
    playPause()
  };
  const handlePrev = () => {
    if (currentSongIndex === 0) {
      setAudioPlayer(new Audio(songs[0]?.file?.asset?.url));
      setCurrentSongIndex(0);
      setMusic(0);
      setIsPlaying(true);
      playPause()
    } else {
      setAudioPlayer(new Audio(songs[currentSongIndex - 1]?.file?.asset?.url));
      setCurrentSongIndex(currentSongIndex - 1);
      setMusic(0);
      setIsPlaying(true);
      playPause()
    }
  };

  useEffect(() => {
    if (audioPlayer) {
      const handleLoadedMetadata = () => {
        audioPlayer.currentTime = music * audioPlayer.duration;
      };

      const handleEnded = () => {
         setAudioPlayer(
           new Audio(songs[currentSongIndex + 1]?.file?.asset?.url)
         );
         setCurrentSongIndex(currentSongIndex + 1);
         setMusic(0);
         setIsPlaying(true);
         playPause();
      };

      audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioPlayer.addEventListener("ended", handleEnded);

      return () => {
        audioPlayer.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audioPlayer.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioPlayer, music]);

  useEffect(() => {
    oldclient
      .fetch(
        `
    *[_type == "podcast"]{
      title,
      subtitle,
      slug,
      description,
      copyright,
      language,
      file{
        asset->{
          url,
        },
      },
      audioimg{
        asset->{
          url,
        },
      },
      category
    }
    `
      )
      .then((data) => {
        setSongs(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

   const handleDownload = async (musicUrl, fileName, index) => {
     toggleDownloadStatus(index); // Toggle download status
     try {
       const response = await fetch(musicUrl);

       if (response.ok) {
         const blob = await response.blob();

         // Create a Blob URL
         const blobUrl = window.URL.createObjectURL(blob);

         // Create an anchor element
         const a = document.createElement("a");
         a.href = blobUrl;

         // Set the download attribute and file name
         a.download = fileName;

         // Trigger a click on the link
         a.click();
         setDownloadStatus(false)

         // Revoke the Blob URL
         window.URL.revokeObjectURL(blobUrl);
       } else {
         console.error("Failed to download the video");
         setDownloadStatus(false);
       }
     } catch (error) {
       console.error("Error during video download:", error);
       setDownloadStatus(false);
     } finally {
       toggleDownloadStatus(index); // Toggle download status back
       setDownloadStatus(false);
     }
   };


const filteredSongs = () => {
  switch (selectedCategory) {
    case "All":
      return songs;
    default:
      return songs.filter((song) => song.category.includes(selectedCategory));
  }
};


 const handleLiked = async (index, image, fileName, file) => {
   // Create a document in Firestore for liked songs
   try {
    // Create a Firestore document for liked songs
    await addDoc(collection(db, "likedSongs"), {
      title: fileName,
      image: image,
      description: file,
      // Add other fields as needed
    });
    console.log("Song liked successfully!");
    // Optionally, you can show a notification or perform other actions upon success
  } catch (error) {
    console.error("Error liking song:", error);
    // Handle error
  }
 };

 const handlePlaylist = async (index, image, fileName, file) => {
   // Create a document in Firestore for playlists
   try {
     // Create a Firestore document for playlists
     await addDoc(collection(db, "playlists"), {
       name: "My Playlist", // Example: You can set a default name or let the user input it
       description: "Description of the playlist", // Example: You can let the user input a description
       songs: [
         // Example: You can store an array of song IDs or details
         {
           title: fileName,
           image: image,
           description: file,
           // Add other fields as needed
         },
       ],
     });
     console.log("Song added to playlist successfully!");
     // Optionally, you can show a notification or perform other actions upon success
   } catch (error) {
     console.error("Error adding song to playlist:", error);
     // Handle error
   }
 };

  return (
    <>
      <div>
        <div className="flex h-[70vh]">
          <div className="sideBar md:w-[20vw] w-[30vw] ">
            <div className="flex flex-col justify-center items-center text-[#fff] text-[20px] font-bold">
              <div className="mb-4 mt-8 p-2">
                <span className=" text-[#a7a6a6]">Browse</span>
                <ul className="flex flex-col">
                  <li
                    className="my-1 cursor-pointer"
                    onClick={() => setSelectedCategory("All")}
                  >
                    All
                  </li>
                  <li
                    className="my-1 cursor-pointer"
                    onClick={() => setSelectedCategory("New Release")}
                  >
                    New Release
                  </li>
                  <li
                    className="my-1 cursor-pointer"
                    onClick={() => setSelectedCategory("Top Playlist")}
                  >
                    Top Playlist
                  </li>
                  <li
                    className="my-1 cursor-pointer"
                    onClick={() => setSelectedCategory("Old Playlist")}
                  >
                    Old PlayList
                  </li>
                  <li
                    className="my-1 cursor-pointer"
                    onClick={() => setSelectedCategory("Dance Song")}
                  >
                    Dance Song
                  </li>
                </ul>
              </div>
              <div className="my-4 p-2">
                <span className=" text-[#a7a6a6]">Library</span>
                <ul className="flex flex-col">
                  <div className="flex items-center">
                    <span className="mr-1">
                      <FaHistory />
                    </span>
                    <li className="my-1 cursor-pointer">History</li>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">
                      <IoMdMusicalNote />
                    </span>
                    <li className="my-1 cursor-pointer">Liked Song</li>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">
                      <RiAlbumFill />
                    </span>
                    <li className="my-1 cursor-pointer">Albums</li>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">
                      <MdPlaylistPlay />
                    </span>
                    <li className="my-1 cursor-pointer">PlayList</li>
                  </div>
                </ul>
              </div>
            </div>
          </div>
          {filteredSongs().length === 0 && (
            <div className="h-screen w-full flex justify-center items-center">
              <DNA
                visible={true}
                height="150"
                width="150"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
              />
            </div>
          )}
          {filteredSongs().length > 0 && (
            <div className="heroSection w-[70vw] md:w-[80vw] h-[70vh] overflow-scroll">
              <div className="md:w-[75vw] w-[65vw] mx-auto h-full">
                <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto ">
                  {filteredSongs().map((song, index) => (
                    <div
                      key={song.slug.current}
                      onClick={() =>
                        playSong(
                          index,
                          song.audioimg.asset.url,
                          song.title,
                          song?.file?.asset?.url
                        )
                      }
                      className=" rounded-lg cursor-pointer select-none shadow-lg bg-white boxShadow border-black border hover:bg-[#5a0a72] transition-all duration-300"
                    >
                      <div className="relative overflow-hidden">
                        {/* {post.banner.asset.url && ( */}
                        <img
                          // src={post.banner.asset.url}
                          src={song.audioimg.asset.url}
                          // alt={post.banner.alt}
                          className="rounded-t-lg object-cover"
                        />
                        {/* )} */}
                      </div>
                      <div className="flex justify-between">
                        <p className="pl-2 pb-2 text-lg text-[#b3b3b3] mt-2">
                          {song.title}
                        </p>
                        <button
                          className="downloadButton mr-1 my-2"
                          onClick={() =>
                            handleDownload(
                              song?.file?.asset?.url,
                              song.title,
                              index
                            )
                          }
                        >
                          {downloadStatus[index] ? "Downloading.." : "Download"}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <FaHeart
                          className="text-[2rem] m-2 text-[#646464] hover:text-[#ff5b5b]"
                          onClick={() =>
                            handleLiked(
                              song?.file?.asset?.url,
                              song.audioimg.asset.url,
                              song.description,
                              song.title,
                              index
                            )
                          }
                        />
                        {/* <CgPlayListCheck className="text-[3rem] m-2 text-[#646464]" /> */}
                        <CgPlayListAdd
                          className="text-[3rem] m-2 text-[#646464]"
                          onClick={() =>
                            handlePlaylist(
                              song?.file?.asset?.url,
                              song.audioimg.asset.url,
                              song.description,
                              song.title,
                              index
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="md:h-[16.6vh] fixed bottom-0 right-0 left-0">
          <div className="flex items-center justify-around h-[16.6vh] my-auto ">
            <img
              src={songs[currentSongIndex]?.audioimg?.asset?.url}
              alt="album-cover"
              className="h-[2rem] object-cover"
            />
            <SkipPrevious
              style={{ fontSize: 40, color: "#fff" }}
              onClick={handlePrev}
              className="cursor-pointer"
            />
            <span onClick={playPause} className="cursor-pointer">
              {isPlaying ? (
                <Pause style={{ fontSize: 40, color: "#fff" }} />
              ) : (
                <PlayArrow style={{ fontSize: 40, color: "#fff" }} />
              )}
            </span>

            <SkipNext
              style={{ fontSize: 40, color: "#fff" }}
              onClick={handleNext}
              className="cursor-pointer"
            />
            <div>
              <VolumeUp style={{ fontSize: 40, color: "#fff" }} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                style={{ width: "100px" }}
              />
            </div>
            <div
              style={{
                width: "50%",
                height: "1vh",
                position: "relative",
              }}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={music}
                onChange={handleMusicChange}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicApp;
