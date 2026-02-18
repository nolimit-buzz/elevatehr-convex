/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as modules_applications from "../modules/applications.js";
import type * as modules_applicationsNode from "../modules/applicationsNode.js";
import type * as modules_assessment from "../modules/assessment.js";
import type * as modules_auth from "../modules/auth.js";
import type * as modules_company from "../modules/company.js";
import type * as modules_emailTemplates from "../modules/emailTemplates.js";
import type * as modules_jobs from "../modules/jobs.js";
import type * as modules_notifications from "../modules/notifications.js";
import type * as modules_statistics from "../modules/statistics.js";
import type * as modules_user from "../modules/user.js";
import type * as templates_ai_assessmentDescription from "../templates/ai/assessmentDescription.js";
import type * as templates_ai_cvAnalysis from "../templates/ai/cvAnalysis.js";
import type * as templates_ai_jobDescription from "../templates/ai/jobDescription.js";
import type * as templates_email_skill_assessment from "../templates/email/skill_assessment.js";
import type * as utils_constants from "../utils/constants.js";
import type * as utils_data from "../utils/data.js";
import type * as utils_email from "../utils/email.js";
import type * as utils_helpers from "../utils/helpers.js";
import type * as utils_permission from "../utils/permission.js";
import type * as utils_types from "../utils/types.js";
import type * as utils_validation from "../utils/validation.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "modules/applications": typeof modules_applications;
  "modules/applicationsNode": typeof modules_applicationsNode;
  "modules/assessment": typeof modules_assessment;
  "modules/auth": typeof modules_auth;
  "modules/company": typeof modules_company;
  "modules/emailTemplates": typeof modules_emailTemplates;
  "modules/jobs": typeof modules_jobs;
  "modules/notifications": typeof modules_notifications;
  "modules/statistics": typeof modules_statistics;
  "modules/user": typeof modules_user;
  "templates/ai/assessmentDescription": typeof templates_ai_assessmentDescription;
  "templates/ai/cvAnalysis": typeof templates_ai_cvAnalysis;
  "templates/ai/jobDescription": typeof templates_ai_jobDescription;
  "templates/email/skill_assessment": typeof templates_email_skill_assessment;
  "utils/constants": typeof utils_constants;
  "utils/data": typeof utils_data;
  "utils/email": typeof utils_email;
  "utils/helpers": typeof utils_helpers;
  "utils/permission": typeof utils_permission;
  "utils/types": typeof utils_types;
  "utils/validation": typeof utils_validation;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
