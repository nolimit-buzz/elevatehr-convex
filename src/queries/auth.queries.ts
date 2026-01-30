import { FunctionArgs } from "convex/server";
import { api } from "../../convex/_generated/api";
import { useAuthedMutation, useAuthedQuery, useConvexResponse } from "@/app/convex.setup";
import { useMutation } from "convex/react";

export type LoginInput = FunctionArgs<typeof api.modules.auth.Login>;
export type ChangePasswordInput = FunctionArgs<typeof api.modules.auth.ChangePassword>;
export type UpdateProfileInput = FunctionArgs<typeof api.modules.auth.UpdateProfile>;

export const AuthQueries = () => {
  const loginMutation = useMutation(api.modules.auth.Login);
  const meMutation = useAuthedMutation(api.modules.auth.Me);
  const changePasswordMutation = useAuthedMutation(api.modules.auth.ChangePassword);
  const updateProfileMutation = useAuthedMutation(api.modules.auth.UpdateProfile);

  const Me = async () => {
    return useConvexResponse(meMutation({}));
  };

  const Login = async (args: LoginInput) => {
    return useConvexResponse(loginMutation(args));
  };

  const Register = async (args: any) => {};

  const ChangePassword = async (args: ChangePasswordInput) => {
    console.log("Changing password with args:", args);

    return useConvexResponse(changePasswordMutation(args));
  };

  const UpdateProfile = async (args: UpdateProfileInput) => {
    return useConvexResponse(updateProfileMutation(args));
  };

  return { Me, Login, Register, ChangePassword, UpdateProfile };
};

type AuthQueriesType = ReturnType<typeof AuthQueries>;
export type AuthQueriesReturnType = {
  Me: AuthQueriesType["Me"];
  Login: Awaited<ReturnType<AuthQueriesType["Login"]>>["result"];
};
