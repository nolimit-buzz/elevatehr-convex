"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Stack, Typography, Alert, Link } from "@mui/material";
import Image from "next/image";
import metadata from "@/utils/metadata";
import { getWithExpiry } from "@/app/utils/authStorage";
import { DefaultConstants } from "@/app/constants/defaults";
import { CompanyQueries } from "@/queries/company.queries";
import { useOnboardingStore } from "./store/useOnboardingStore";

// Import steps
import OnboardingStep1 from "./components/OnboardingStep1";
import OnboardingStep2 from "./components/OnboardingStep2";
import OnboardingStep3 from "./components/OnboardingStep3";
import OnboardingStep4 from "./components/OnboardingStep4";

// Import custom stepper
import VerticalStepper from "./components/VerticalStepper";

const steps = [
    { label: "Website", description: "Your company's home online" },
    { label: "Branding", description: "Your company's logo" },
    { label: "Booking", description: "Setup your interview link" },
    { label: "About", description: "Tell us about your company" },
];

// Steps the user may skip instead of filling in (indexes into `steps`)
const SKIPPABLE_STEPS = new Set([1, 2]);

const OnboardingPage = () => {
    const router = useRouter();
    const { GenerateUploadUrl, UpdateLogo, UpdateCompany } = CompanyQueries();
    const {
        activeStep,
        data: onboardingData,
        skipped,
        loading,
        error,
        next,
        back,
        skip,
        updateData,
        setLoading,
        setError,
        reset,
    } = useOnboardingStore();

    useEffect(() => {
        const token = getWithExpiry(DefaultConstants.tokenName);
        if (!token) {
            router.push("/");
            return;
        }
    }, [router]);

    const handleNext = () => next(steps.length - 1);
    const handleBack = () => back();
    const handleSkip = () => skip(steps.length - 1);
    const handleDataUpdate = (data: Partial<typeof onboardingData>) => updateData(data);

    const handleComplete = async () => {
        setLoading(true);
        setError("");

        try {
            const company: Record<string, string | boolean> = {
                company_website: onboardingData.website,
                about_company: onboardingData.about,
                onboarding_completed: true,
            };

            if (!skipped[2] && onboardingData.booking_link) {
                company.booking_link = onboardingData.booking_link;
            }

            if (!skipped[1] && onboardingData.company_logo) {
                const { result: uploadUrl, error: uploadError } = await GenerateUploadUrl();
                if (uploadError || !uploadUrl) {
                    throw new Error(uploadError || "Failed to prepare logo upload.");
                }

                const uploadResponse = await fetch(uploadUrl as string, {
                    method: "POST",
                    headers: { "Content-Type": onboardingData.company_logo.type },
                    body: onboardingData.company_logo,
                });
                const { storageId } = await uploadResponse.json();

                const { error: logoError } = await UpdateLogo(storageId);
                if (logoError) {
                    throw new Error(logoError);
                }
            }

            const { error: updateError } = await UpdateCompany({ company });
            if (updateError) {
                throw new Error(updateError);
            }

            reset();
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "An error occurred during profile update.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = (activeStep: number) => {
        switch (activeStep) {
            case 0: return onboardingData.website.trim() !== '';
            case 1: return onboardingData.company_logo !== null;
            case 2: return onboardingData.booking_link.trim() !== '';
            case 3: return onboardingData.about.trim().length >= 50;
            default: return false;
        }
    }

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return <OnboardingStep1 data={onboardingData} onUpdate={handleDataUpdate} />;
            case 1:
                return <OnboardingStep2 data={onboardingData} onUpdate={handleDataUpdate} />;
            case 2:
                return <OnboardingStep3 data={onboardingData} onUpdate={handleDataUpdate} />;
            case 3:
                return <OnboardingStep4 data={onboardingData} onUpdate={handleDataUpdate} />;
            default:
                return <Typography>Unknown Step</Typography>;
        }
    };

    return (
        <Stack direction="row" sx={{ height: "100vh", width: "100%", backgroundColor: '#f7f8fc' }}>
            {/* Sidebar */}
            <Box
                sx={{
                    width: { md: '400px' },
                    backgroundColor: 'secondary.main',
                    color: 'primary.contrastText',
                    p: 4,
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                {activeStep === 0 ? (
                    <>
                        <Box>
                            <Stack spacing={2} direction="row" alignItems="center" sx={{ mb: 6 }}>
                                <Image src={metadata.logo} alt={`${metadata.title} Logo`} width={180} height={80} />
                            </Stack>
                            <Typography fontSize={32} lineHeight={1.1} fontWeight="600" sx={{ mb: 2, mt: 6 }}>
                                A few clicks away from creating your company profile.
                            </Typography>
                            <Typography variant="body1" color="primary.contrastText" sx={{ opacity: 0.8 , mt: 4 , maxWidth: 300 }}>
                                Complete your company profile in minutes. Save time and attract the best talent.
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ mt: 6 }}>
                        <Stack spacing={2} direction="row" alignItems="center" sx={{ mb: 6 }}>
                            <Image src={metadata.logo} alt={`${metadata.title} Logo`} width={180} height={80} />
                        </Stack>
                        <VerticalStepper steps={steps} activeStep={activeStep} />
                    </Box>
                )}
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <Stack direction="row" justifyContent="flex-end" sx={{ p: 2, pr: 4 }}>
                    <Typography variant="body2">
                        Having trouble? <Link href="#" underline="hover">Get Help</Link>
                    </Typography>
                </Stack>
                <Box sx={{ flex: 1, p: { xs: 2, sm: 4, md: 8 }, overflowY: 'auto', display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ maxWidth: 700, mx: 'auto', width: '100%' }}>
                        {renderStepContent()}
                        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
                    </Box>
                </Box>

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        p: { xs: 2, md: 4 },
                        backgroundColor: 'transparent',
                    }}
                >
                    {activeStep > 0 ? (
                        <Button variant="text" onClick={handleBack} sx={{ color: 'grey.600', textTransform: 'uppercase' }}>Previous Step</Button>
                    ) : (
                        <div />
                    )}

                    <Stack direction="row" spacing={2} alignItems="center">
                        {SKIPPABLE_STEPS.has(activeStep) && (
                            <Button variant="text" onClick={handleSkip} sx={{ color: 'grey.600', textTransform: 'uppercase' }}>Skip</Button>
                        )}

                        {activeStep < steps.length - 1 ? (
                            <Button variant="contained" onClick={handleNext} disabled={!isStepValid(activeStep)} sx={{ borderRadius: '8px', px: 4, py: 1.2 }}>Next →</Button>
                        ) : (
                            <Button variant="contained" onClick={handleComplete} disabled={loading || !isStepValid(activeStep)} sx={{ borderRadius: '8px', px: 4, py: 1.2 }}>
                                {loading ? 'Finishing up...' : 'Complete Setup'}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    );
};

export default OnboardingPage;
