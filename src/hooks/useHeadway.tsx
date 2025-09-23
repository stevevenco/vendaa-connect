import { useEffect } from "react";

export const useHeadway = () => {
  useEffect(() => {
    // Configure Headway
    (window as any).HW_config = {
      selector: "#headway-badge", // where badge will be injected
      account: "J1Npdy",          // your Headway account ID
    };

    // Inject script once
    if (!document.getElementById("headway-script")) {
      const script = document.createElement("script");
      script.id = "headway-script";
      script.async = true;
      script.src = "https://cdn.headwayapp.co/widget.js";
      document.body.appendChild(script);
    }
  }, []);
};
