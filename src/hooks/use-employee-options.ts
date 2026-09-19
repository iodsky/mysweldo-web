import { useGetAllEmployees } from "@/api/generated/endpoints/employees/employees";
import { unwrapPage } from "@/api/helpers";
import type { EmployeeBasicDto } from "@/api/generated/model";

export type EmployeeOption = { value: string; label: string };

interface UseEmployeeOptionsParams {
  staleTime?: number;
  gcTime?: number;
}

export const useEmployeeOptions = ({
  staleTime,
  gcTime,
}: UseEmployeeOptionsParams = {}) => {
  const { data: employeesData } = useGetAllEmployees(
    { pageNo: 0, limit: 100 },
    {
      query: {
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
