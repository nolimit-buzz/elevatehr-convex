import { FunctionArgs } from "convex/server";
import { api } from "../../convex/_generated/api";
import { useAuthedMutation, useAuthedQuery, resolveConvexResponse } from "@/app/convex.setup";
import { useMutation } from "convex/react";

export type LoginInput = FunctionArgs<typeof api.modules.auth.Login>;
export type ChangePasswordInput = FunctionArgs<typeof api.modules.auth.ChangePassword>;
export type UpdateProfileInput = FunctionArgs<typeof api.modules.auth.UpdateProfile>;
export type RegisterInput = FunctionArgs<typeof api.modules.company.create>;

export const AuthQueries = () => {
  const loginMutation = useMutation(api.modules.auth.Login);
  const registerMutation = useMutation(api.modules.company.create);
  const meMutation = useAuthedMutation(api.modules.auth.Me);
  const changePasswordMutation = useAuthedMutation(api.modules.auth.ChangePassword);
  const updateProfileMutation = useAuthedMutation(api.modules.auth.UpdateProfile);
  const Me = async () => {
    return resolveConvexResponse(meMutation({}));
  };

  const Login = async (args: LoginInput) => {
    return resolveConvexResponse(loginMutation(args));
  };

  const Register = async (args: RegisterInput) => {
    return resolveConvexResponse(registerMutation(args));
  };

  const ChangePassword = async (args: ChangePasswordInput) => {
    console.log("Changing password with args:", args);

    return resolveConvexResponse(changePasswordMutation(args));
  };

  const UpdateProfile = async (args: UpdateProfileInput) => {
    return resolveConvexResponse(updateProfileMutation(args));
  };

  return { Me, Login, Register, ChangePassword, UpdateProfile };
};

type AuthQueriesType = ReturnType<typeof AuthQueries>;
export type AuthQueriesReturnType = {
  Me: AuthQueriesType["Me"];
  Login: Awaited<ReturnType<AuthQueriesType["Login"]>>["result"];
};
