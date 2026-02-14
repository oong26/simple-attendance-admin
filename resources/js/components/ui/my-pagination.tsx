import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext
} from "@/components/ui/pagination";

export default function MyPagination({ data }) {
    if (!data || !data.data || data.data.length === 0) return null;

    const links = data.links || [];

    const prevUrl = data.prev_page_url;
    const nextUrl = data.next_page_url;

    const pageLinks = links.filter(
        l => !l.label.includes("Previous") && !l.label.includes("Next")
    );

    return (
        <Pagination className="mt-4 lg:justify-end">
        <PaginationContent>
            <PaginationItem>
                <PaginationPrevious href={prevUrl || undefined} />
            </PaginationItem>

            {pageLinks.map((link, i) => {
            const cleanLabel = link.label.replace(/&laquo;|&raquo;/g, "").trim();

            return link.url ? (
                <PaginationItem key={i}>
                    <PaginationLink isActive={link.active}
                        aria-disabled={link.active}
                        className={link.active ? "pointer-events-none opacity-50" : ""}
                        href={`${link.url}${link.url.includes('?') ? '&' : '?'}perPage=${new URLSearchParams(window.location.search).get('perPage') ?? 10}`}>
                        {cleanLabel}
                    </PaginationLink>
                </PaginationItem>
            ) : (
                <PaginationItem key={i}>
                    <PaginationLink>{cleanLabel}</PaginationLink>
                </PaginationItem>
            );
            })}

            <PaginationItem>
            <PaginationNext
                disabled={!nextUrl}
                href={nextUrl || undefined}
            />
            </PaginationItem>
        </PaginationContent>
        </Pagination>
    );
}
