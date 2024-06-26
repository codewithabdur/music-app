import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { FaHeart, FaHistory, FaHome, FaVolumeMute } from "react-icons/fa";
import { CgPlayListAdd } from "react-icons/cg";
import {
  Pause,
  PlayArrow,
  SkipNext,
  SkipPrevious,
  VolumeUp,
} from "@material-ui/icons";
import { MdPlaylistPlay } from "react-icons/md";
import { IoMdMusicalNote } from "react-icons/io";
import { DNA } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import Disc from "../../assets/disk.png";
import "./Liked.css"

const Liked = () => {
  const [userData, setUserData] = useState(null);
  const [likedSongs, setlikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0); // Initialize index state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [music, setMusic] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(
    Array(likedSongs.length).fill(false)
  );
   const [muteAudio, setMuteAudio] = useState(true);

   const mute = () => {
     setMuteAudio(!muteAudio);
     if (muteAudio) {
       audioPlayer.volume = 0;
     } else {
       audioPlayer.volume = 1;
     }
   };

  const toggleShowMore = (songIndex) => {
    setShowMore((prevShowMore) => {
      const updatedShowMore = [...prevShowMore];
      updatedShowMore[songIndex] = !updatedShowMore[songIndex];
      return updatedShowMore;
    });
  };

  const playPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  useEffect(() => {
    if (audioPlayer) {
      audioPlayer.addEventListener("timeupdate", handleTimeUpdate);

      return () => {
        audioPlayer.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [audioPlayer]);

  const handleTimeUpdate = () => {
    setCurrentTime(audioPlayer.currentTime);
  };
  useEffect(() => {
    const fetchUserDataAndliked = async () => {
      try {
        const userEmail = localStorage.getItem("user");

        if (!userEmail) {
          setError("No user email found in localStorage");
          setLoading(false);
          return;
        }

        const usersCollectionRef = collection(db, "users");
        const q = query(usersCollectionRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("No matching user found");
          setLoading(false);
          return;
        }

        const data = querySnapshot.docs[0].data();
        setUserData(data);

        const likedDocRef = doc(db, "liked", data.uid);
        const likedSongsDocSnapshot = await getDoc(likedDocRef);

        if (likedSongsDocSnapshot.exists()) {
          const likedSongsData = likedSongsDocSnapshot.data().songs || [];
          setlikedSongs(likedSongsData);
          localStorage.setItem("liked", JSON.stringify(likedSongsData));
        } else {
          setError("No liked found for this user");
        }
      } catch (err) {
        setError("An error occurred while fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndliked();
  }, []);

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value;
    setVolume(newVolume);
    if (audioPlayer) {
      audioPlayer.volume = newVolume;
    }
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

  const playSong = (url, fileName, image, index) => {
    // Pause the previous audio player if it exists
    if (audioPlayer) {
      audioPlayer.pause();
    }
    window.document.title = `CodeWithAbdur || MelodicVerse - ${fileName} Song Your Personalized Music Experience`;

    // Set up the new audio player with the correct URL
    const newAudioPlayer = new Audio(url);
    setAudioPlayer(newAudioPlayer);
    setIndex(index);
    setIsPlaying(false);
    setMusic(0);
    setVolume(newAudioPlayer ? newAudioPlayer.volume : volume);
    playPause();
  };

  const handleNext = () => {
    if (index < likedSongs.length - 1) {
      setIndex(index + 1);
      playSong(
        likedSongs[index + 1]?.file,
        likedSongs[index + 1]?.fileName,
        likedSongs[index + 1]?.image,
        index + 1
      );
      setMusic(0);
    } else {
      // Optionally, you can loop back to the beginning when reaching the end
      setIndex(0);
      playSong(
        likedSongs[0]?.file,
        likedSongs[0]?.fileName,
        likedSongs[0]?.image,
        0
      );
      setMusic(0);
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
      playSong(
        likedSongs[index - 1]?.file,
        likedSongs[index - 1]?.fileName,
        likedSongs[index - 1]?.image,
        index - 1
      );
      setMusic(0);
    } else {
      // Optionally, you can go to the last song when pressing previous on the first song
      setIndex(likedSongs.length - 1);
      playSong(
        likedSongs[likedSongs.length - 1]?.file,
        likedSongs[likedSongs.length - 1]?.fileName,
        likedSongs[likedSongs.length - 1]?.image,
        likedSongs.length - 1
      );
      setMusic(0);
    }
  };
  const checkPlayer = () => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
  };
  useEffect(() => {
    if (audioPlayer) {
      const handleLoadedMetadata = () => {
        audioPlayer.currentTime = music * audioPlayer.duration;
      };

      const handleEnded = () => {
        if (audioPlayer) {
          audioPlayer.pause();
        }
        console.log(likedSongs[index + 1]?.file);
        setAudioPlayer(new Audio(likedSongs[index + 1]?.file));
        setIndex(index + 1);
        setMusic(0);
        setIsPlaying(false);
        setVolume(audioPlayer ? audioPlayer.volume : volume);
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

  if (loading) {
    return (
      <div className="h-screen bg-[#000] w-full flex justify-center items-center">
        <DNA
          visible={true}
          height="150"
          width="150"
          ariaLabel="dna-loading"
          wrapperStyle={{}}
          wrapperclassName="dna-wrapper"
        />
      </div>
    );
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <div className=" w-full bg-[#111]">
      <div className="p-7 flex">
        <div className="sideBar md:w-[20vw] w-[40vw] ">
          <div className="flex flex-col justify-center items-center text-[#fff] text-[20px] font-bold">
            <div className="my-4 p-2">
              <span className=" text-[#a7a6a6]">Library</span>
              <ul className="flex flex-col justify-evenly min-h-[70vh]">
                <div
                  className="flex items-center hover:text-[#623cca] transition-all"
                  onClick={() => {
                    navigate(`/`);
                    checkPlayer();
                  }}
                >
                  <span className="mr-1">
                    <FaHome />
                  </span>
                  <li className="my-1 cursor-pointer">Home</li>
                </div>
                <div
                  className="flex items-center mt-4"
                  onClick={() => {
                    navigate(`/history`);
                    checkPlayer();
                  }}
                >
                  <span className="mr-1">
                    <FaHistory />
                  </span>
                  <li className="my-1 cursor-pointer">History</li>
                </div>
                <div
                  className="flex items-center hover:text-[#623cca] transition-all"
                  onClick={() => {
                    navigate(`/likedpage`);
                    checkPlayer();
                  }}
                >
                  <span className="mr-1">
                    <MdPlaylistPlay />
                  </span>
                  <li className="my-1 cursor-pointer">Liked</li>
                </div>
                <div
                  className="flex items-center hover:text-[#623cca] transition-all"
                  onClick={() => {
                    navigate(`/playlistpage`);
                    checkPlayer();
                  }}
                >
                  <span className="mr-1">
                    <MdPlaylistPlay />
                  </span>
                  <li className="my-1 cursor-pointer">PlayList</li>
                </div>
              </ul>
            </div>
          </div>
        </div>
        <div className="w-[70vw] md:w-[80vw]">
          {likedSongs.length > 0 && (
            <div className="heroSection w-[70vw] md:w-[80vw] h-[70vh] overflow-scroll">
              <div className="md:w-[75vw] w-[65vw] mx-auto h-full">
                <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto ">
                  {likedSongs.map((song, songIndex) => (
                    <div
                      onClick={() => {
                        playSong(
                          likedSongs[songIndex]?.file,
                          likedSongs[songIndex]?.description,
                          likedSongs[songIndex]?.image,
                          songIndex
                        );
                      }}
                      key={song.description}
                      className=" rounded-lg cursor-pointer select-none shadow-lg bg-white boxShadow border-black border hover:bg-[#5a0a72] transition-all duration-300"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={song.image}
                          alt={song.title ? song.title : "image"}
                          className="rounded-t-lg object-cover h-[15rem] w-full text-white"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <p className="pl-2 pb-2 text-lg text-[#b3b3b3] mt-2">
                          {song.title}
                        </p>
                        {showMore[songIndex] ? (
                          <p className="pl-2 py-2 text-lg text-[#b3b3b3] mt-2">
                            {song.description}....
                            <a
                              onClick={() => toggleShowMore(songIndex)}
                              className="text-[#6c11b6]"
                            >
                              Show Less
                            </a>
                          </p>
                        ) : (
                          <p className="pl-2 py-2 text-lg text-[#b3b3b3] mt-2">
                            {song?.description.substring(0, 100)}....
                            <a
                              className="text-[#6c11b6]"
                              onClick={() => toggleShowMore(songIndex)}
                            >
                              Show More
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="md:h-[16.6vh] fixed bottom-0 bg-[#000] right-0 left-0 z-30">
        <div className="flex items-center justify-around h-[16.6vh] my-auto ">
          <img
            src={likedSongs[index]?.image ? likedSongs[index]?.image : Disc}
            alt={likedSongs[index] ? likedSongs[index]?.title : "song image"}
            className={`h-[2rem] w-[2rem] object-cover rounded-[50%] ${
              isPlaying ? "moveCircle" : ""
            } text-white`}
            loading="lazy"
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
          <div className="flex">
            {muteAudio ? (
              <VolumeUp
                style={{ fontSize: 40, color: "#fff", cursor: "pointer" }}
                onClick={mute}
              />
            ) : (
              <FaVolumeMute
                className="text-[30px] text-[#fff] cursor-pointer"
                onClick={mute}
              />
            )}
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
              value={audioPlayer ? currentTime / audioPlayer.duration || 0 : 0} // Ensure division by zero is handled
              onChange={handleMusicChange}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Liked;
