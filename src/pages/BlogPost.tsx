import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { getPostBySlug } from "@/data/posts";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
          <p className="mt-3 text-body-muted">We couldn't find the post you're looking for.</p>
          <Link to="/blog" className="mt-6 inline-block text-sm text-accent hover:underline">
            ← Back to blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/blog">Blog</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{post.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <article className="container py-16 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 text-xs text-body-muted">
          <Badge variant="outline" className="text-xs">{post.category}</Badge>
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>

        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          {post.title}
        </h1>

        <p className="mt-4 text-lg text-body-muted leading-relaxed">
          {post.excerpt}
        </p>

        {/* Divider */}
        <div className="mt-8 border-t border-border" />

        {/* Content */}
        <div
          className="mt-8 max-w-none text-body text-sm leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mt-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back link */}
        <div className="mt-12 border-t border-border pt-6">
          <Link to="/blog" className="text-sm text-accent hover:underline">
            ← All posts
          </Link>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
