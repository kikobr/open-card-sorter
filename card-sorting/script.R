# set your project folder

# load clustering function
source("cluster-card-sorting.R")
source("ggdendro.R")

# load datasets
datasets = list(
  list(name="Alfredo", file="Alfredo.csv"),
  list(name="Rafael", file="Rafael.csv")
)

# plot hierarchical clustering
clusters <- getCardSortingClusters(datasets)

median_clusters = 2
hcdata <- dendro_data_k(clusters$hclust, median_clusters)
plot_ggdendro(
  hcdata,
  direction   = "lr", # horizontal
  #direction   = "tb", # vertical
  expand.y    = 0.5,
  label.size  = 4.5,
  branch.size = 1
) +
  theme_light() +
  ylab("Distância (quanto menor, mais próximo)") +
  xlab("") +
  theme(panel.border = element_blank())+
  scale_fill_continuous(guide = guide_legend(title = NULL))


# plot table
table <- getClusterTable(hclust=clusters$hclust, k=median_clusters, index_df=clusters$index_df)
View(table)
