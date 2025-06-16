import  {useAuth}  from "../context/AuthContext";

export default function usePermission(model) {
    const {permissions} = useAuth();
    const modelPerm = permissions.find(p => p.model == model)
    
    return modelPerm?.actions  || [];
}