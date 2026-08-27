"use client";
import { Dispatch, SetStateAction, useState } from "react";
import ArrowRightIcon from "../../icon/element/ArrowRightIcon";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import ModalSelectMonthYear from "../ModalSelectMonthYear";
import { useRouter } from "next/navigation";

interface SelectMontYearProps {
  year: number;
  month: number;
  setYear: Dispatch<SetStateAction<number>>;
  setMonth: Dispatch<SetStateAction<number>>;
  id?: number;
}

const SelectMontYear = (props: SelectMontYearProps) => {
  const { year, month, setMonth, setYear, id } = props;
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function openModal() {
    setOpen(true);
  }

  function ChangeMonthYear(year: number, month: number) {
    setMonth(month);
    setYear(year);
  }

  return (
    <div>
      <div className="flex h-9 w-fit items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
        <Button
          variant="ghost"
          className="h-fit cursor-pointer p-0! font-semibold text-primary"
          onClick={openModal}
        >
          Tháng {month}, {year}
        </Button>
        <Separator orientation="vertical" className="bg-gray-1!" />
        <Button
          onClick={() => {
            if (id) router.push(`/admin/monthly-detail/${id}`);
          }}
          variant="ghost"
          className={`h-fit gap-0.5! p-0! font-semibold text-slate-600 ${id ? "cursor-pointer" : "cursor-not-allowed"}`}
        >
          Xem chi tiết <ArrowRightIcon className="size-4" />
        </Button>
      </div>
      {open && year && month && (
        <ModalSelectMonthYear
          open={open}
          onClose={() => setOpen(false)}
          initialYear={year}
          initialMonth={month}
          ChangeMonthYear={ChangeMonthYear}
        />
      )}
    </div>
  );
};

export default SelectMontYear;
