import { setFailed, setOutput } from "@actions/core";
import { context } from "@actions/github";
import axios from "./requests/axios";
import * as utils from "./utils";
import * as INPUTS from "./constants/inputs";
import * as REQUESTS from "./constants/requests";

const allowedProjects = utils.getProjectsFromInput(INPUTS.ALLOWED_PROJECTS);
const blockedProjects = utils.getProjectsFromInput(INPUTS.BLOCKED_PROJECTS);

const run = async () => {
  try {
    utils.validateTrigger(context.eventName);
    utils.validateProjectLists(allowedProjects, blockedProjects);

    const result = await axios.post(REQUESTS.ACTION_URL, {
      allowedProjects,
      blockedProjects,
      pullRequestDescription: utils.createPRDescription(
        context.payload.pull_request?.body
      ),
      pullRequestName: context.payload.pull_request?.title,
      pullRequestNumber: context.payload.pull_request?.number,
      pullRequestURL: context.payload.pull_request?.html_url,
    });

    console.log(result.data);
    setOutput("status", result.status);
  } catch (error) {
    if (utils.isAxiosError(error))
      console.log(error.response?.data || "Unknown error");
    if (error instanceof Error) setFailed(error.message);
    else setFailed("Unknown error");
  }
};

run();
