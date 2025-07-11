import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getShop } from "../../api/API";

const CompanyInfoContext = createContext();

export const CompanyInfoProvider = ({ children }) => {
  const [companyInfo, setCompanyInfo] = useState(null);

  const fetchCompanyInfo = useCallback(async () => {
    try {
      const res = await getShop();
      if (res?.data) {
        setCompanyInfo(res.data);
        localStorage.setItem("companyInfo", JSON.stringify(res.data));
        return res.data;
      } else {
        // Do not redirect, just log or handle accordingly
        console.warn("No company info found from API.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching company info:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const localData = localStorage.getItem("companyInfo");
    if (localData) {
      setCompanyInfo(JSON.parse(localData));
    } else {
      fetchCompanyInfo();
    }
  }, [fetchCompanyInfo]);

  return (
    <CompanyInfoContext.Provider value={{ companyInfo, fetchCompanyInfo }}>
      {children}
    </CompanyInfoContext.Provider>
  );
};

export const useCompanyInfo = () => useContext(CompanyInfoContext);
