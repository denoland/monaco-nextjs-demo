"use client";

import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";

export default function IDE() {
  const [URL, setURL] = useState("");
  const [project, setProject] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to call the create project API
    const createProject = async () => {
      try {
        const response = await fetch("/api/createproject", {
          method: "GET", // Assuming it's a GET request, update as needed
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const responseData = await response.json();
        setProject(responseData); // Update the state variable with the response data
        // Optionally update the state or do something with the response
      } catch (error) {
        console.error("Failed to create project:", error);
      }
    };

    createProject();
  }, []);

  const project_id = project["id"]; // Get the project id from the state variable

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const pollDeploymentStatus = async(deploymentId) => {
    let response;
    try {
      response = await fetch("/api/getdeployment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deploymentId }),
      });
    } catch (error) {
      console.log(error);
    }
    return await response.json();
  }

  const updateStatus = (message) => {
    if (document.querySelector(".ide-message")) {
      document.querySelector(".ide-message").textContent = message;
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    updateStatus("Deploying code...");

    const codeText = event.target.querySelector(".monaco-scrollable-element").textContent;
    try {
      const response = await fetch("/api/createdeployment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: codeText, project: project_id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Poll deployment details until status is no longer pending.
      let responseData = await response.json();
      while (responseData["status"] === "pending") {
        await delay(3000);
        responseData = await pollDeploymentStatus(responseData["id"]);
        console.log(responseData);
      }

      // Define URL and show iframe.
      if (responseData["status"] === "success") {
        setURL(`http://${responseData.domains[0]}`);
        updateStatus("Successfully deployed.");
      } else {
        updateStatus("Deployment failed.");
        throw new Error("Deployment failed");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoad = () => {
    setIsLoading(false); // Set loading to false when iframe loads successfully
  };

  const handleError = () => {
    setIsLoading(true); // Keep loading true or set an error state if the iframe fails to load
  };

  return (
    <div className="flex justify-center items-start pt-10 h-screen">
      <div className="w-full max-w-4xl p-4 border">
        <form action="#" onSubmit={handleSubmit}>
          <div className="">
            <label htmlFor="comment" className="sr-only">
              Add your code
            </label>
            <Editor
              height="50vh"
              defaultLanguage="javascript"
              defaultValue='Deno.serve(req => new Response("Hello!"));'
            />
          </div>
          <div className="flex justify-between pt-2">
            <div className="flex items-center space-x-5"></div>
            <div className="flex-shrink-0">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Run
              </button>
            </div>
          </div>
        </form>
        {/* Conditional rendering for iframe or loading message */}
        <div className="mt-4">
          <p className="ide-message mb-4"></p>
          {isLoading && <p className="text-center">Deployed code will run here.</p>}
          <iframe
            src={URL}
            title="Deployed Project"
            width="100%"
            height="300px"
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: isLoading ? "none" : "block" }} // Hide iframe while loading
          ></iframe>
        </div>
      </div>
    </div>
  );
}
