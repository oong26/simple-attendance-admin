import { router } from "@inertiajs/react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

function navigateTo(url: string | null) {
    if (!url) return;
    const params = new URLSearchParams(window.location.search);

    // Parse with a dummy base to safely extract path+search regardless of scheme.
    // This avoids "blocked:mixed-content" when Laravel returns http:// URLs
    // behind an HTTPS reverse proxy.
    const target = new URL(url, window.location.origin);

    // Preserve existing query params (perPage, q, etc.) not already in target
    params.forEach((value, key) => {
        if (!target.searchParams.has(key)) {
            target.searchParams.set(key, value);
        }
    });

    // Use only pathname + search — never the scheme/host from Laravel's URL
    router.visit(target.pathname + target.search, {
        preserveState: true,
        preserveScroll: false,
    });
}

export default function MyPagination({ data }: { data: any }) {
    if (!data || !data.data || data.data.length === 0) return null;

    const links = data.links || [];
    const prevUrl: string | null = data.prev_page_url;
    const nextUrl: string | null = data.next_page_url;

    const pageLinks = links.filter(
        (l: any) => !l.label.includes("Previous") && !l.label.includes("Next")
    );

    return (
        <Pagination className="mt-4 lg:justify-end">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        aria-disabled={!prevUrl}
                        className={!prevUrl ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        onClick={(e) => { e.preventDefault(); navigateTo(prevUrl); }}
                    />
                </PaginationItem>

                {pageLinks.map((link: any, i: number) => {
                    const cleanLabel = link.label.replace(/&laquo;|&raquo;/g, "").trim();

                    return link.url ? (
                        <PaginationItem key={i}>
                            <PaginationLink
                                isActive={link.active}
                                aria-disabled={link.active}
                                className={link.active ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                onClick={(e) => { e.preventDefault(); navigateTo(link.url); }}
                            >
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
                        aria-disabled={!nextUrl}
                        className={!nextUrl ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        onClick={(e) => { e.preventDefault(); navigateTo(nextUrl); }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
