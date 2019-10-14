# set your project folder
setwd("~/Documents/design-science-r/card-sorting/")

# load clustering function
source("cluster-card-sorting.R")

# load datasets
datasets = list(
  list(name="Alfredo", file="Alfredo.csv"),
  list(name="Rafael", file="Rafael.csv")
)

# plot hierarchical clustering
clusters <- getCardSortingClusters(datasets)
plot(clusters$hclust, main = "Dendrograma com clusterização hierárquica")
median_clusters = 2
rect.hclust(clusters$hclust, k = median_clusters, border = 2:6)

# plot table
table <- getClusterTable(hclust=clusters$hclust, k=median_clusters)
View(table)
