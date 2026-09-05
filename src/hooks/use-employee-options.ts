import { useGetAllEmployees } from "@/api/generated/endpoints/employees/employees";
import { unwrapPage } from "@/api/helpers";
import type { EmployeeBasicDto } from "@/api/generated/model";
import type { QueryKey } from "@tanstack/react-query";

export type EmployeeOption = { value: string; label: string };

interface UseEmployeeOptionsParams {
  queryKey?: QueryKey;
  staleTime?: number;
  gcTime?: number;
}

export const useEmployeeOptions = ({
  queryKey,
  staleTime,
  gcTime,
}: UseEmployeeOptionsParams = {}) => {
  const { data: employeesData } = useGetAllEmployees(
    { pageNo: 0, limit: 100 },
    {
      query: {
        ...(queryKey ? { queryKey } : {}),
        ...(staleTime !== undefined ? { staleTime } : {}),
        ...(gcTime !== undefined ? { gcTime } : {}),
      },
    },
  );

  const options = unwrapPage<EmployeeBasicDto>(employeesData).content
    .map((employee) => ({
      value: String(employee.id ?? ""),
      label: `${employee.firstName ?? ""} ${employee.lastName ?? ""}`,
    }))
    .filter((opt) => opt.value);

  return { options };
};