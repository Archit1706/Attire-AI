"use client";
import React, { useRef, useEffect, useState, useContext } from "react";
import { AiOutlineClear, AiFillGoogleCircle } from "react-icons/ai";
import { BsPencil, BsFillEraserFill } from "react-icons/bs";
import { FiSend } from "react-icons/fi";
import { TbPhotoSearch, TbArrowBack } from "react-icons/tb";
import { toast } from "react-toastify";
import { fadeIn } from "../../utils/fadein";
import { motion } from "framer-motion";

const page = () => {
    const [imgURL, setImgURL] = useState(
        typeof window !== "undefined" && localStorage?.getItem("image")
            ? localStorage.getItem("image")
            : ""
    );
    // const [ngrok, setNgrok] = useState("");
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState("pen");
    const [outfitPrompt, setOutfitPrompt] = useState("");
    const [hashtags, setHashtags] = useState([
        // "tags",
        // "please",
        // "here",
        // "thanks",
    ]);
    // const imgURL =
    //     "https://cdn6.dissolve.com/p/D1028_55_728/D1028_55_728_1200.jpg"; //SENT BY BACKEND
    const [penSize, setPenSize] = useState(30);
    const width = 512;
    const height = 512;
    let userImage = "";

    const loadingGif = "https://i.ibb.co/1bTL1b6/loadinggif.gif";
    const [prevousImgURL, setpreviousImgURL] = useState("");
    const [keywords, setKeywords] = useState("");
    const [mask, setMask] = useState("");
    const [llmResponse, setLLMResponse] = useState([]); 
    const [llmImages, setLLMImages] = useState([
        loadingGif,
        loadingGif,
        loadingGif,
        loadingGif,
    ]);
    const [previousResponses, setPreviousResponses] = useState([]); //array of responses from backend
    const [_, update] = useState(0);
    const [responses, setResponses] = useState([
        // "https://dummyimage.com/512x512",
        // "https://dummyimage.com/512x512",
        // "https://dummyimage.com/512x512",
        // "https://dummyimage.com/512x512",
    ]); //array of responses from backend

    const colorClasses = [
        "text-blue-400",
        "text-green-400",
        "text-yellow-400",
        "text-red-400",
    ];

    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            const context = canvas.getContext("2d");
            context.scale(1, 1);
            context.lineCap = "round";
            context.strokeStyle = "black";
            context.lineWidth = penSize;
            contextRef.current = context;
        }
    }, [penSize, imgURL]);

    useEffect(() => {
        if (responses.length == 0) {
            fetch(`${localStorage.getItem("ngrok")}/api/sdapi/caption`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    image: imgURL,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    setHashtags(data.response);
                    return;
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [responses]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) {
            return;
        }
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        if (currentTool === "eraser") {
            contextRef.current.globalCompositeOperation = "destination-out";
        } else {
            contextRef.current.globalCompositeOperation = "source-over";
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    const sendImage = async () => {
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL();
        if (outfitPrompt === "") {
            toast.error("Please enter a prompt");
            return;
        }
        setpreviousImgURL(imgURL);
        if (dataURL === blank) {
            // toast.error("LLM");
            fetch(`${localStorage.getItem("ngrok")}/api/llama/prompt`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gender: localStorage.getItem("gender"),
                    prompt: outfitPrompt,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    setLLMImages([
                        loadingGif,
                        loadingGif,
                        loadingGif,
                        loadingGif,
                    ]);
                    if (data.response[0]!==undefined){ //Internet search response
                        setLLMResponse(data.response);
                        for (
                            let i = 0;
                            i < data.response.length;
                            i++
                        ) {
                            fetch(
                                `${localStorage.getItem(
                                    "ngrok"
                                )}/api/sdapi/txt2img`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        gender: localStorage.getItem("gender"),
                                        prompt: data.response[i],
                                        keywords: data.keywords,
                                    }),
                                }
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    console.log(data);
                                    llmImages[i] = data.response[0];
                                    setLLMImages(llmImages);
                                    update(Math.random());
                                    return data;
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        }}
                    else{ //Recommendation system response
                        const names=[];
                        const images=[];
                        for(const key in data.response){
                            names.push(key);
                            images.push(data.response[key]);
                        }
                        setLLMResponse(names);
                        setLLMImages(images);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            try {
                console.table([dataURL, imgURL, outfitPrompt]);
                setResponses([loadingGif, loadingGif, loadingGif, loadingGif]);
                fetch(`${localStorage.getItem("ngrok")}/api/sdapi/img2img`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        gender: localStorage.getItem('gender'),
                        mask: dataURL,
                        image: imgURL,
                        prompt: outfitPrompt,
                    }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log(data);
                        //setLLMResponse([]);
                        setResponses(data.response);
                        return data;
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.error(error);
            }
        }
    };

    const googleSearch = () => {

        try {
            fetch(`${localStorage.getItem("ngrok")}/api/sdapi/upscale`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    image: imgURL,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data.response[0]);
                    if (window !== "undefined") {
                        window.open(
                            "https://lens.google.com/uploadbyurl?url=" +
                                data.response[0],
                            "_blank"
                        );
                    }
                });

            console.log(outfitPrompt);
        } catch (error) {
            console.error(error);
        }
    };

    const selectImage = (e) => {
        e.preventDefault();
        console.log(e.target.src);
        localStorage.setItem("image", e.target.src);
        setImgURL(e.target.src);
        setPreviousResponses(responses);
        setResponses([]);
    };

    const showPreviousResponses = () => {
        if (responses.length === 0 && previousResponses.length > 0) {
            setResponses(previousResponses);
            setPreviousResponses([]);
        } else {
            localStorage.setItem("image", prevousImgURL);
            setImgURL(prevousImgURL);
            setResponses([]);
        }
    };

    return (
        <section className="flex justify-center items-center min-h-screen h-auto md:items-start flex-col md:flex-row p-4 gap-4">
            <div className="w-[90vw] md:w-1/2 text-center flex flex-col justify-center items-center gap-2">
                <button
                    className="group border-none h-auto bg-white/60 hover:bg-white/70
                    shadow-gray-300 text-gray-700 p-2 rounded-md text-center
                    flex flex-row justify-center items-center hover:shadow-md
                    text-xl tracking-tight font-semibold hover:scale-105
                    transition-all duration-200 cursor-pointer w-auto gap-2 tooltip tooltip-right self-start"
                    onClick={showPreviousResponses}
                    data-tip={"Go to your previous image"}
                >
                    <p className="group-hover:rotate-6">
                        <TbArrowBack className="font-bold h-6 w-6" />
                    </p>
                    <span>Back</span>
                </button>

                <h3 className="text-md font-medium text-gray-600">
                    Draw on the canvas as per your preference
                </h3>

                {Array.isArray(responses) && responses.length > 0 ? (
                    <div className="w-full rounded-xl bg-white/60 hover:bg-white/70 shadow-gray-300 shadow-lg p-2 md:p-8 text-gray-200 text-center">
                        <div className="grid grid-cols-2 gap-4">
                            {responses.map((response, index) => (
                                <div
                                    key={index}
                                    className="aspect-square bg-white/60 hover:bg-white/70 rounded-xl shadow-gray-300 shadow-lg"
                                >
                                    <img
                                        src={response}
                                        alt="response"
                                        className="object-cover rounded-xl"
                                        onClick={selectImage}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center w-full text-center flex-col gap-4">
                        <motion.div
                            variants={fadeIn("right", 0.3)}
                            initial="hidden"
                            whileInView={"show"}
                            viewport={{ once: true, amount: 0.4 }}
                            className="flex justify-center items-center flex-col w-11/12 rounded-xl bg-white/60 hover:bg-white/70 shadow-gray-300 shadow-lg text-gray-200 aspect-square "
                        >
                            <canvas
                                onMouseDown={startDrawing}
                                onMouseUp={finishDrawing}
                                onMouseMove={draw}
                                width={width}
                                height={height}
                                ref={canvasRef}
                                style={{
                                    //width: `${width}px`,
                                    //height: `${height}px`,
                                    background:
                                        `url(${imgURL})` || `url(${userImage})`,
                                    backgroundSize: `${width}px ${height}px`,
                                    backgroundRepeat: "no-repeat",
                                }}
                                className="cursor-crosshair"
                                // className="border-2 border-primary shadow-md shadow-primary/50 aspect-square md:h-[512px] md:w-[512px]"
                            />
                        </motion.div>
                        {/* hashtags */}
                        {Array.isArray(hashtags) && hashtags.length > 0 && (
                            <motion.div
                                variants={fadeIn("right", 0.3)}
                                initial="hidden"
                                whileInView={"show"}
                                viewport={{ once: true, amount: 0.4 }}
                                className="flex flex-row flex-wrap justify-center items-center w-full text-center text-md font-bold gap-2"
                            >
                                {hashtags.map((hashtag, index) => (
                                    <p
                                        key={index}
                                        className={`rounded-full bg-white/60 hover:bg-white/70 shadow-gray-300 shadow-md p-2 ${
                                            colorClasses[
                                                index % colorClasses.length
                                            ]
                                        }`}
                                    >
                                        #{hashtag}
                                    </p>
                                ))}
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {/* everything on the right */}
            <motion.div
                variants={fadeIn("left", 0.3)}
                initial="hidden"
                whileInView={"show"}
                viewport={{ once: true, amount: 0.4 }}
                className="flex justify-center flex-col items-center md:w-1/2 w-full gap-4"
            >
                {/* top right div with tools and search button */}
                <div className="w-full flex justify-center items-center flex-col md:flex-row gap-4 md:gap-0">
                    {/* tools */}
                    <motion.div
                        variants={fadeIn("left", 0.4)}
                        initial="hidden"
                        whileInView={"show"}
                        viewport={{ once: true, amount: 0.4 }}
                        className="flex justify-center items-center flex-col md:w-1/2 gap-4"
                    >
                        {/* clear */}
                        <button
                            className="group border-none h-auto bg-white/60 hover:bg-white/70
                    shadow-gray-300 text-gray-700 p-2 rounded-md text-center
                    flex flex-row justify-center items-center hover:shadow-md
                    text-xl tracking-tight font-semibold hover:scale-105
                    transition-all duration-200 cursor-pointer w-36 gap-2 tooltip tooltip-left"
                            onClick={clearCanvas}
                            data-tip={"Clear Canvas"}
                        >
                            <p className="group-hover:rotate-6">
                                <AiOutlineClear className="font-bold h-6 w-6" />
                            </p>
                            <span>Clear</span>
                        </button>

                        {/* pen / eraser */}
                        <button
                            className="group border-none h-auto bg-white/60 hover:bg-white/70
                    shadow-gray-300 text-gray-700 p-2 rounded-md text-center
                    flex flex-row justify-center items-center hover:shadow-md
                    text-xl tracking-tight font-semibold hover:scale-105
                    transition-all duration-200 cursor-pointer w-36 gap-2 tooltip tooltip-left"
                            data-tip={
                                currentTool === "pen"
                                    ? "Select Eraser"
                                    : "Select Pen"
                            }
                            onClick={() =>
                                setCurrentTool(
                                    currentTool === "pen" ? "eraser" : "pen"
                                )
                            }
                        >
                            {currentTool === "pen" ? (
                                <>
                                    <p className="group-hover:rotate-6">
                                        <BsFillEraserFill className="font-bold h-6 w-6" />
                                    </p>
                                    <span>Eraser</span>
                                </>
                            ) : (
                                <>
                                    <p className="group-hover:rotate-6">
                                        <BsPencil className="font-bold h-6 w-6" />
                                    </p>
                                    <span>Pen</span>
                                </>
                            )}
                        </button>

                        {/* send */}
                        <button
                            className="group border-none h-auto bg-white/60 hover:bg-white/70
                    shadow-gray-300 text-gray-700 p-2 rounded-md text-center
                    flex flex-row justify-center items-center hover:shadow-md
                    text-xl tracking-tight font-semibold hover:scale-105
                    transition-all duration-200 cursor-pointer w-36 gap-2 tooltip tooltip-left"
                            onClick={sendImage}
                            data-tip={"Generate Outfits"}
                        >
                            <p className="group-hover:rotate-6">
                                <FiSend className="font-bold h-6 w-6" />
                            </p>
                            <span>Send</span>
                        </button>
                    </motion.div>

                    {/* google search and pen resizer */}
                    <motion.div
                        variants={fadeIn("left", 0.5)}
                        initial="hidden"
                        whileInView={"show"}
                        viewport={{ once: true, amount: 0.4 }}
                        className="w-full md:w-1/2 flex justify-center items-center flex-col gap-4 md:gap-8"
                    >
                        {/* google */}
                        <div className="w-full flex justify-center">
                            <button
                                className="group border-none h-auto bg-white/60 hover:bg-white/70
                    shadow-gray-300 text-gray-700 p-2 rounded-md text-center
                    flex flex-row justify-center items-center hover:shadow-md
                    text-xl tracking-tight font-semibold hover:scale-105
                    transition-all duration-200 cursor-pointer w-36 gap-2 tooltip tooltip-left"
                                onClick={googleSearch}
                                data-tip={"Search Google Lens"}
                            >
                                <p className="group-hover:rotate-6">
                                    <AiFillGoogleCircle className="font-bold h-6 w-6" />
                                </p>
                                <span>Search</span>
                            </button>
                        </div>

                        {/* slider */}
                        <div
                            className="w-full tooltip tooltip-top"
                            data-tip={"Pen Size - " + penSize}
                        >
                            <input
                                type="range"
                                min={30}
                                max={50}
                                value={penSize}
                                step={5}
                                className="range range-xs w-11/12 bg-transparent/20"
                                // give style color and background color
                                style={{
                                    color: "#000000",
                                }}
                                onChange={(e) =>
                                    setPenSize(parseInt(e.target.value))
                                }
                            />
                        </div>
                    </motion.div>
                </div>

                {/* chat/api response */}
                {Array.isArray(llmResponse) && llmResponse.length > 0 && (
                    <div className="w-full rounded-xl bg-white/60 hover:bg-white/70 shadow-gray-300 shadow-lg relative text-gray-700 p-4 ">
                        <div className="grid grid-cols-2 gap-4">
                            {llmResponse.map((response, index) => (
                                <div
                                    key={index}
                                    className="flex justif-center flex-row  bg-white/60 hover:bg-white/70 rounded-xl shadow-gray-300 shadow-lg gap-4 p-2"
                                >
                                    <img
                                        src={
                                            llmImages[index] ||
                                            "https://dummyimage.com/512x512"
                                        }
                                        alt="response"
                                        className="object-cover rounded-xl cursor-pointer"
                                        onClick={selectImage}
                                        style={{
                                            width: "128px",
                                            height: "128px",
                                        }}
                                    />
                                    <p className="font-semibold text-lg tracking-tight" onClick={() => {navigator.clipboard.writeText(response)}}
>
                                        {response}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* prompt / search bar */}
                <div className="w-full rounded-xl bg-white/60 hover:bg-white/70 shadow-gray-300 shadow-lg p-4 text-gray-200 relative min-w-80 max-w-3xl">
                    <div className="relative">
                        <input
                            type="text"
                            id="password"
                            className="w-full pl-3 pr-10 py-2 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Prompt here..."
                            onChange={(e) => {
                                setOutfitPrompt(e.target.value);
                            }}
                        />
                        <button className="block w-7 h-7 text-center text-xl leading-0 absolute top-2 right-2 text-gray-400 focus:outline-none hover:text-gray-200 transition-colors">
                            <TbPhotoSearch className="w-full h-full" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default page;

const blank =
    "data:image/png;base64,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MACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAIEH9IYCAbVe32sAAAAASUVORK5CYII=";
