import { useAuthedMutation, resolveConvexResponse } from "@/app/convex.setup";
import { FunctionArgs } from "convex/server";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type CompanyLoginInput = FunctionArgs<typeof api.modules.company.create>;
export type CompanyUpdateInput = FunctionArgs<
  typeof api.modules.company.update
>;

export const CompanyQueries = () => {
  const GetMutation = useAuthedMutation(api.modules.company.get);
  const CreateMutation = useAuthedMutation(api.modules.company.create);
  const UpdateMutation = useAuthedMutation(api.modules.company.update);
  const GenerateUploadUrlMutation = useAuthedMutation(
    api.modules.company.generateUploadUrl,
  );
  const UpdateLogoMutation = useAuthedMutation(api.modules.company.updateLogo);
  const SeedEmailTemplatesMutation = useAuthedMutation(
    api.modules.company.seedEmailTemplatesForCompany,
  );

  const GetCompany = async () => {
    if (!GetMutation) {
      return { result: null, error: "Mutations not ready" };
    }
    const { result, error } = await resolveConvexResponse(GetMutation());
    return { result, error };
  };

  const CreateCompany = async (args: CompanyLoginInput) => {
    if (!CreateMutation) {
      return { result: null, error: "Mutations not ready" };
    }
    const { result, error } = await resolveConvexResponse(CreateMutation(args));
    return { result, error };
  };

  const UpdateCompany = async (args: CompanyUpdateInput) => {
    if (!UpdateMutation) {
      return { result: null, error: "Mutations not ready" };
    }

    console.log("Updating company with args:", args);
    const { result, error } = await resolveConvexResponse(UpdateMutation(args));
    return { result, error };
  };

  const GenerateUploadUrl = async () => {
    if (!GenerateUploadUrlMutation) {
      return { result: null, error: "Mutations not ready" };
    }
    const { result, error } = await resolveConvexResponse(
      GenerateUploadUrlMutation(),
    );
    return { result, error };
  };

  const UpdateLogo = async (storageId: Id<"_storage">) => {
    if (!UpdateLogoMutation) {
      return { result: null, error: "Mutations not ready" };
    }
    const { result, error } = await resolveConvexResponse(
      UpdateLogoMutation({ storageId }),
    );
    return { result, error };
  };

  const SeedEmailTemplates = async () => {
    if (!SeedEmailTemplatesMutation) {
      return { result: null, error: "Mutations not ready" };
    }
    const { result, error } = await resolveConvexResponse(
      SeedEmailTemplatesMutation(),
    );
    return { result, error };
  };

  return {
    GetCompany,
    CreateCompany,
    UpdateCompany,
    GenerateUploadUrl,
    UpdateLogo,
    SeedEmailTemplates,
  };
};
