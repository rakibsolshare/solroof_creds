import { SolarPlant } from "./index";

export type RootStackParamList = {
    Home: undefined;
    Detail: { plant: SolarPlant };
    Edit: { plant?: SolarPlant };
    Settings: undefined;
};
