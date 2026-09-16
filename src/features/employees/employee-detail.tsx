import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Breadcrumbs, Anchor, Text, Loader } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useGetEmployeeById } from "@/api/generated/endpoints/employees/employees";
import { unwrapData } from "@/api/helpers";
import { EmployeeForm } from "@/features/employees/employee-form-modal";
import ProfileHeaderCard from "@/features/employees/components/profile-header-card";
import PersonalInfoCard from "@/features/employees/components/personal-info-card";
import GovernmentIdsCard from "@/features/employees/components/government-ids-card";
import EmploymentCard from "@/features/employees/components/employment-card";
import CompensationCard from "@/features/employees/components/compensation-card";
import BenefitsCard from "@/features/employees/components/benefits-card";
import type { Employee } from "@/types";

function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data, isLoading, error } = useGetEmployeeById(parseInt(id ?? "0"), {
    query: { enabled: !!id },
  });

  const employee = unwrapData<Employee>(data);

  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <Loader size="xl" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Text size="lg" fw={700} c="red">
            Failed to load employee details
          </Text>
          <Button onClick={() => navigate("/hr/employees")}>
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditingEmployee(employee);
    setIsEditing(true);
  };

  const handleFormClose = () => {
    setIsEditing(false);
    setEditingEmployee(null);
  };

  const breadcrumbItems = [
    { title: "HR", href: "/hr/dashboard" },
    { title: "Employees", href: "/hr/employees" },
    { title: `${employee.firstName} ${employee.lastName}`, href: "#" },
  ];

  return (
    <>
      <Breadcrumbs mb="md">
        {breadcrumbItems.map((item, index) =>
          index === breadcrumbItems.length - 1 ? (
            <Text key={index} size="sm">
              {item.title}
            </Text>
          ) : (
            <Anchor
              key={index}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              size="sm"
            >
              {item.title}
            </Anchor>
          ),
        )}
      </Breadcrumbs>

      <div className="flex flex-col flex-1 gap-5 overflow-y-auto">
        <ProfileHeaderCard
          employee={employee}
          action={
            <Button leftSection={<IconPencil size={16} />} onClick={handleEdit}>
              Edit
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:flex-1 md:min-h-0 md:auto-rows-fr">
          <PersonalInfoCard employee={employee} />
          <GovernmentIdsCard employee={employee} />
          <EmploymentCard employee={employee} />
          <CompensationCard employee={employee} />
        </div>
        <BenefitsCard employee={employee} />
      </div>

      <EmployeeForm
        opened={isEditing}
        onClose={handleFormClose}
        employee={editingEmployee || undefined}
        isEditing={true}
      />
    </>
  );
}

export default Page;