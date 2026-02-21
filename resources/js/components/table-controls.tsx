import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';

interface Props {
    search: string;
    pageLength: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPageLengthChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function TableControls({
    search,
    pageLength,
    onSearchChange,
    onPageLengthChange,
}: Props) {
    return (
        <div className="flex justify-between gap-4">
            <div className="flex items-center gap-4">
                <Label>Showing</Label>
                <NativeSelect value={pageLength} onChange={onPageLengthChange}>
                    <NativeSelectOption value="10">10</NativeSelectOption>
                    <NativeSelectOption value="25">25</NativeSelectOption>
                    <NativeSelectOption value="50">50</NativeSelectOption>
                    <NativeSelectOption value="100">100</NativeSelectOption>
                </NativeSelect>
            </div>

            <div className="w-75">
                <Input
                    placeholder="Search here..."
                    type="search"
                    name="q"
                    id="q"
                    value={search}
                    onChange={onSearchChange}
                />
            </div>
        </div>
    );
}
