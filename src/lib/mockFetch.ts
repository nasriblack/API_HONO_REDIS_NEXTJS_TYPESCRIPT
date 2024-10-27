export const countryName = {
    
    duration:45345.345,
    results:[
        "TUNISIA",
        "TURKEY",
        "TURKMENISTAN",
        "TURKS AND CAICOS ISLANDS (THE)",
        "TUVALU"
      ],}

export default async function mockFetch() {
    return {
        status:200,
        json:async () => countryName
    }
}